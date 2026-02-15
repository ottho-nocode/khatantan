-- ============================================================
-- LMS Marketplace — Initial Schema
-- ============================================================

-- Helper: get current user role from JWT or profiles table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles: public read" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Profiles: self update" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. INSTRUCTOR PROFILES
-- ============================================================
CREATE TABLE public.instructor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  stripe_account_id TEXT,
  stripe_onboarded BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  total_students INTEGER DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructor profiles: public read" ON public.instructor_profiles
  FOR SELECT USING (true);
CREATE POLICY "Instructor profiles: self manage" ON public.instructor_profiles
  FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "Instructor profiles: admin manage" ON public.instructor_profiles
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories: public read" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Categories: admin manage" ON public.categories
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- 4. TAGS
-- ============================================================
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags: public read" ON public.tags
  FOR SELECT USING (true);
CREATE POLICY "Tags: admin manage" ON public.tags
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- 5. COURSES
-- ============================================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructor_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  description TEXT,
  thumbnail_url TEXT,
  promo_video_url TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
  language TEXT NOT NULL DEFAULT 'fr',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  requirements TEXT[] DEFAULT '{}',
  what_you_will_learn TEXT[] DEFAULT '{}',
  total_duration_seconds INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_category ON public.courses(category_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_slug ON public.courses(slug);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses: public read published" ON public.courses
  FOR SELECT USING (status = 'published');
CREATE POLICY "Courses: instructor manage own" ON public.courses
  FOR ALL USING (
    instructor_id IN (
      SELECT id FROM public.instructor_profiles WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY "Courses: admin manage all" ON public.courses
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- 6. COURSE_TAGS (junction)
-- ============================================================
CREATE TABLE public.course_tags (
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);

ALTER TABLE public.course_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course tags: public read" ON public.course_tags
  FOR SELECT USING (true);
CREATE POLICY "Course tags: instructor manage" ON public.course_tags
  FOR ALL USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );

-- ============================================================
-- 7. MODULES
-- ============================================================
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modules_course ON public.modules(course_id);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules: public read published" ON public.modules
  FOR SELECT USING (
    course_id IN (SELECT id FROM public.courses WHERE status = 'published')
    OR course_id IN (
      SELECT c.id FROM public.courses c
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );
CREATE POLICY "Modules: instructor manage" ON public.modules
  FOR ALL USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );
CREATE POLICY "Modules: admin manage" ON public.modules
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- 8. LESSONS
-- ============================================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'text', 'quiz')),
  position INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  video_duration_seconds INTEGER DEFAULT 0,
  content TEXT,
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_module ON public.lessons(module_id);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons: preview or enrolled or instructor" ON public.lessons
  FOR SELECT USING (
    is_preview = TRUE
    OR module_id IN (
      SELECT m.id FROM public.modules m
      JOIN public.courses c ON m.course_id = c.id
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE e.student_id = auth.uid() AND c.status = 'published'
    )
    OR module_id IN (
      SELECT m.id FROM public.modules m
      JOIN public.courses c ON m.course_id = c.id
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );
CREATE POLICY "Lessons: instructor manage" ON public.lessons
  FOR ALL USING (
    module_id IN (
      SELECT m.id FROM public.modules m
      JOIN public.courses c ON m.course_id = c.id
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );
CREATE POLICY "Lessons: admin manage" ON public.lessons
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- 9. ENROLLMENTS
-- ============================================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  payment_intent_id TEXT,
  amount_paid_cents INTEGER DEFAULT 0,
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrollments: student read own" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Enrollments: student create" ON public.enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Enrollments: instructor read own courses" ON public.enrollments
  FOR SELECT USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );
CREATE POLICY "Enrollments: admin read all" ON public.enrollments
  FOR SELECT USING (public.get_user_role() = 'admin');

-- ============================================================
-- 10. LESSON PROGRESS
-- ============================================================
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  video_position_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_enrollment ON public.lesson_progress(enrollment_id);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Progress: student own" ON public.lesson_progress
  FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Progress: instructor read" ON public.lesson_progress
  FOR SELECT USING (
    enrollment_id IN (
      SELECT e.id FROM public.enrollments e
      JOIN public.courses c ON e.course_id = c.id
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );

-- ============================================================
-- 11. QUIZZES
-- ============================================================
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  max_attempts INTEGER DEFAULT NULL,
  time_limit_seconds INTEGER DEFAULT NULL,
  randomize_questions BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes: enrolled or instructor" ON public.quizzes
  FOR SELECT USING (
    lesson_id IN (
      SELECT l.id FROM public.lessons l
      JOIN public.modules m ON l.module_id = m.id
      JOIN public.enrollments e ON e.course_id = m.course_id
      WHERE e.student_id = auth.uid()
    )
    OR lesson_id IN (
      SELECT l.id FROM public.lessons l
      JOIN public.modules m ON l.module_id = m.id
      JOIN public.courses c ON m.course_id = c.id
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );
CREATE POLICY "Quizzes: instructor manage" ON public.quizzes
  FOR ALL USING (
    lesson_id IN (
      SELECT l.id FROM public.lessons l
      JOIN public.modules m ON l.module_id = m.id
      JOIN public.courses c ON m.course_id = c.id
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );

-- ============================================================
-- 12. QUIZ QUESTIONS
-- ============================================================
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'single_choice'
    CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false')),
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quiz questions: enrolled or instructor" ON public.quiz_questions
  FOR SELECT USING (
    quiz_id IN (SELECT id FROM public.quizzes)
  );
CREATE POLICY "Quiz questions: instructor manage" ON public.quiz_questions
  FOR ALL USING (
    quiz_id IN (
      SELECT q.id FROM public.quizzes q
      JOIN public.lessons l ON q.lesson_id = l.id
      JOIN public.modules m ON l.module_id = m.id
      JOIN public.courses c ON m.course_id = c.id
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );

-- ============================================================
-- 13. QUIZ OPTIONS
-- ============================================================
CREATE TABLE public.quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_quiz_options_question ON public.quiz_options(question_id);

ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;

-- Students can read options but NOT is_correct (handled via view or RPC)
CREATE POLICY "Quiz options: enrolled or instructor" ON public.quiz_options
  FOR SELECT USING (
    question_id IN (SELECT id FROM public.quiz_questions)
  );
CREATE POLICY "Quiz options: instructor manage" ON public.quiz_options
  FOR ALL USING (
    question_id IN (
      SELECT qq.id FROM public.quiz_questions qq
      JOIN public.quizzes q ON qq.quiz_id = q.id
      JOIN public.lessons l ON q.lesson_id = l.id
      JOIN public.modules m ON l.module_id = m.id
      JOIN public.courses c ON m.course_id = c.id
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );

-- ============================================================
-- 14. QUIZ ATTEMPTS
-- ============================================================
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  earned_points INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_spent_seconds INTEGER
);

CREATE INDEX idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attempts: student own" ON public.quiz_attempts
  FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Attempts: instructor read" ON public.quiz_attempts
  FOR SELECT USING (
    quiz_id IN (
      SELECT q.id FROM public.quizzes q
      JOIN public.lessons l ON q.lesson_id = l.id
      JOIN public.modules m ON l.module_id = m.id
      JOIN public.courses c ON m.course_id = c.id
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );

-- ============================================================
-- 15. CERTIFICATES
-- ============================================================
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Certificates: student own" ON public.certificates
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Certificates: public verify" ON public.certificates
  FOR SELECT USING (true);

-- ============================================================
-- 16. REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  instructor_reply TEXT,
  instructor_replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_reviews_course ON public.reviews(course_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews: public read visible" ON public.reviews
  FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "Reviews: student create if enrolled" ON public.reviews
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND course_id IN (SELECT course_id FROM public.enrollments WHERE student_id = auth.uid())
  );
CREATE POLICY "Reviews: student update own" ON public.reviews
  FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Reviews: instructor reply" ON public.reviews
  FOR UPDATE USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE ip.profile_id = auth.uid()
    )
  );

-- ============================================================
-- 17. BADGES
-- ============================================================
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('learning', 'social', 'achievement', 'special')),
  xp_reward INTEGER NOT NULL DEFAULT 0,
  rule_type TEXT NOT NULL,
  rule_threshold INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges: public read" ON public.badges
  FOR SELECT USING (true);
CREATE POLICY "Badges: admin manage" ON public.badges
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- 18. USER BADGES
-- ============================================================
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, badge_id)
);

CREATE INDEX idx_user_badges_profile ON public.user_badges(profile_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User badges: public read" ON public.user_badges
  FOR SELECT USING (true);

-- ============================================================
-- 19. XP EVENTS
-- ============================================================
CREATE TABLE public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_events_profile ON public.xp_events(profile_id);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "XP events: own read" ON public.xp_events
  FOR SELECT USING (profile_id = auth.uid());

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Recalculate enrollment progress when lesson_progress changes
CREATE OR REPLACE FUNCTION public.recalculate_progress(p_enrollment_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_percent NUMERIC;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE lp.status = 'completed')
  INTO v_total, v_completed
  FROM public.lessons l
  JOIN public.modules m ON l.module_id = m.id
  JOIN public.enrollments e ON e.course_id = m.course_id
  LEFT JOIN public.lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = e.id
  WHERE e.id = p_enrollment_id AND l.is_required = TRUE;

  v_percent := CASE WHEN v_total > 0 THEN ROUND((v_completed::NUMERIC / v_total) * 100, 2) ELSE 0 END;

  UPDATE public.enrollments SET
    progress_percent = v_percent,
    completed_at = CASE WHEN v_percent >= 100 THEN now() ELSE NULL END
  WHERE id = p_enrollment_id;

  RETURN v_percent;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_recalculate_progress()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.recalculate_progress(NEW.enrollment_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_lesson_progress_change
  AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_progress();

-- Update course rating when review changes
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_course_id UUID;
BEGIN
  v_course_id := COALESCE(NEW.course_id, OLD.course_id);
  UPDATE public.courses SET
    avg_rating = COALESCE(
      (SELECT AVG(rating)::NUMERIC(3,2) FROM public.reviews WHERE course_id = v_course_id AND is_visible = TRUE),
      0
    ),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE course_id = v_course_id AND is_visible = TRUE)
  WHERE id = v_course_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_course_rating();

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_instructor_profiles BEFORE UPDATE ON public.instructor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_courses BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_modules BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_lessons BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_lesson_progress BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_quizzes BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_reviews BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- LEADERBOARD MATERIALIZED VIEW
-- ============================================================
CREATE MATERIALIZED VIEW public.leaderboard AS
SELECT
  p.id AS profile_id,
  p.display_name,
  p.avatar_url,
  p.xp,
  COUNT(DISTINCT ub.badge_id) AS badge_count,
  COUNT(DISTINCT e.course_id) FILTER (WHERE e.completed_at IS NOT NULL) AS courses_completed,
  RANK() OVER (ORDER BY p.xp DESC) AS rank
FROM public.profiles p
LEFT JOIN public.user_badges ub ON ub.profile_id = p.id
LEFT JOIN public.enrollments e ON e.student_id = p.id
GROUP BY p.id, p.display_name, p.avatar_url, p.xp
ORDER BY p.xp DESC;

CREATE UNIQUE INDEX idx_leaderboard_profile ON public.leaderboard(profile_id);

-- ============================================================
-- RPC: Submit quiz (server-side grading)
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_quiz(
  p_quiz_id UUID,
  p_answers JSONB -- [{question_id, selected_option_ids[]}]
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_quiz RECORD;
  v_question RECORD;
  v_answer JSONB;
  v_total_points INTEGER := 0;
  v_earned_points INTEGER := 0;
  v_results JSONB := '[]'::JSONB;
  v_correct_ids UUID[];
  v_selected_ids UUID[];
  v_is_correct BOOLEAN;
  v_score INTEGER;
  v_passed BOOLEAN;
  v_attempt_count INTEGER;
  v_student_id UUID := auth.uid();
BEGIN
  -- Get quiz config
  SELECT * INTO v_quiz FROM public.quizzes WHERE id = p_quiz_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz not found';
  END IF;

  -- Check max attempts
  IF v_quiz.max_attempts IS NOT NULL THEN
    SELECT COUNT(*) INTO v_attempt_count
    FROM public.quiz_attempts
    WHERE quiz_id = p_quiz_id AND student_id = v_student_id;

    IF v_attempt_count >= v_quiz.max_attempts THEN
      RAISE EXCEPTION 'Maximum attempts reached';
    END IF;
  END IF;

  -- Grade each answer
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers) LOOP
    SELECT qq.*, ARRAY(
      SELECT qo.id FROM public.quiz_options qo
      WHERE qo.question_id = qq.id AND qo.is_correct = TRUE
    ) AS correct_option_ids
    INTO v_question
    FROM public.quiz_questions qq
    WHERE qq.id = (v_answer->>'question_id')::UUID AND qq.quiz_id = p_quiz_id;

    IF NOT FOUND THEN CONTINUE; END IF;

    v_total_points := v_total_points + v_question.points;

    -- Parse selected option ids
    SELECT ARRAY(
      SELECT (jsonb_array_elements_text(v_answer->'selected_option_ids'))::UUID
    ) INTO v_selected_ids;

    v_is_correct := v_selected_ids @> v_question.correct_option_ids
                    AND v_question.correct_option_ids @> v_selected_ids;

    IF v_is_correct THEN
      v_earned_points := v_earned_points + v_question.points;
    END IF;

    v_results := v_results || jsonb_build_object(
      'question_id', v_question.id,
      'is_correct', v_is_correct,
      'correct_option_ids', to_jsonb(v_question.correct_option_ids),
      'explanation', v_question.explanation
    );
  END LOOP;

  -- Calculate score
  v_score := CASE WHEN v_total_points > 0
    THEN ROUND((v_earned_points::NUMERIC / v_total_points) * 100)
    ELSE 0 END;
  v_passed := v_score >= v_quiz.passing_score;

  -- Record attempt
  INSERT INTO public.quiz_attempts (student_id, quiz_id, score, total_points, earned_points, passed, answers)
  VALUES (v_student_id, p_quiz_id, v_score, v_total_points, v_earned_points, v_passed, p_answers);

  -- If passed, mark lesson as completed
  IF v_passed THEN
    INSERT INTO public.lesson_progress (student_id, lesson_id, enrollment_id, status, completed_at)
    SELECT v_student_id, v_quiz.lesson_id, e.id, 'completed', now()
    FROM public.enrollments e
    JOIN public.modules m ON m.course_id = e.course_id
    JOIN public.lessons l ON l.module_id = m.id
    WHERE l.id = v_quiz.lesson_id AND e.student_id = v_student_id
    LIMIT 1
    ON CONFLICT (student_id, lesson_id)
    DO UPDATE SET status = 'completed', completed_at = now();
  END IF;

  RETURN jsonb_build_object(
    'score', v_score,
    'passed', v_passed,
    'earned_points', v_earned_points,
    'total_points', v_total_points,
    'results', v_results
  );
END;
$$;
