export type Locale = "fr" | "en" | "mn";

export const localeLabels: Record<Locale, string> = {
  fr: "Fran\u00e7ais",
  en: "English",
  mn: "\u041c\u043e\u043d\u0433\u043e\u043b",
};

export const localeFlags: Record<Locale, string> = {
  fr: "\ud83c\uddeb\ud83c\uddf7",
  en: "\ud83c\uddec\ud83c\udde7",
  mn: "\ud83c\uddf2\ud83c\uddf3",
};

type Translations = Record<string, string>;

const fr: Translations = {
  // Nav
  "nav.home": "Accueil",
  "nav.courses": "Cours",
  "nav.about": "\u00c0 propos",
  "nav.login": "Connexion",
  "nav.register": "S'inscrire",
  "nav.admin": "Administration",
  "nav.instructor": "Espace Enseignant",
  "nav.student": "Espace \u00c9l\u00e8ve",
  "nav.instructorShort": "Enseignant",
  "nav.studentShort": "\u00c9l\u00e8ve",

  // Sidebar
  "sidebar.studentArea": "Espace \u00c9l\u00e8ve",
  "sidebar.dashboard": "Tableau de bord",
  "sidebar.myCourses": "Mes cours",
  "sidebar.favorites": "Favoris",
  "sidebar.settings": "Param\u00e8tres",
  "sidebar.logout": "D\u00e9connexion",
  "sidebar.menu": "Menu",
  "sidebar.instructorArea": "Espace Enseignant",
  "sidebar.analytics": "Analytics",
  "sidebar.profile": "Profil",
  "sidebar.newCourse": "Nouveau cours",
  "sidebar.admin": "Administration",
  "sidebar.users": "Utilisateurs",
  "sidebar.courses": "Cours",
  "sidebar.categories": "Cat\u00e9gories",
  "sidebar.badges": "Badges",

  // Footer
  "footer.description":
    "La plateforme d'apprentissage d\u00e9di\u00e9e au d\u00e9veloppement personnel et spirituel en Mongolie.",
  "footer.platform": "Plateforme",
  "footer.allCourses": "Tous les cours",
  "footer.about": "\u00c0 propos",
  "footer.pricing": "Tarifs",
  "footer.support": "Support",
  "footer.contact": "Contact",
  "footer.terms": "CGV",
  "footer.faq": "FAQ",
  "footer.followUs": "Suivez-nous",
  "footer.copyright": "Tous droits r\u00e9serv\u00e9s.",

  // Home
  "home.heroTitle": "\u00c9veillez votre potentiel spirituel et personnel",
  "home.heroSubtitle":
    "La premi\u00e8re marketplace de cours en ligne en Mongolie d\u00e9di\u00e9e au bien-\u00eatre, \u00e0 la spiritualit\u00e9 et au d\u00e9veloppement personnel.",
  "home.discoverCourses": "D\u00e9couvrir les cours",
  "home.learnMore": "En savoir plus",
  "home.exploreCategories": "Explorez par cat\u00e9gories",
  "home.exploreCategoriesSubtitle":
    "Trouvez le chemin qui vous correspond parmi nos th\u00e9matiques vari\u00e9es.",
  "home.popularCourses": "Cours populaires",
  "home.popularCoursesSubtitle":
    "Les formations les plus pl\u00e9biscit\u00e9es par notre communaut\u00e9.",
  "home.viewAll": "Voir tout",
  "home.viewAllCourses": "Voir tous les cours",
  "home.joinCommunity": "Rejoignez la communaut\u00e9 Khatantan",
  "home.joinCommunitySubtitle":
    "Inscrivez-vous pour recevoir nos conseils bien-\u00eatre et \u00eatre inform\u00e9 des nouveaux cours.",
  "home.emailPlaceholder": "Votre adresse email",
  "home.subscribe": "S'inscrire",

  // Courses
  "courses.allCourses": "Tous les cours",
  "courses.sortPopularity": "Trier par : Popularit\u00e9",
  "courses.sortPriceAsc": "Prix croissant",
  "courses.sortPriceDesc": "Prix d\u00e9croissant",
  "courses.filters": "Filtres",
  "courses.search": "Rechercher...",
  "courses.searchCourse": "Rechercher un cours...",
  "courses.level": "Niveau",
  "courses.beginner": "D\u00e9butant",
  "courses.intermediate": "Interm\u00e9diaire",
  "courses.advanced": "Avanc\u00e9",
  "courses.allLevels": "Tous niveaux",
  "courses.price": "Prix",
  "courses.free": "Gratuit",
  "courses.paid": "Payant",
  "courses.filter": "Filtrer",
  "courses.noCourses": "Aucun cours trouv\u00e9.",
  "courses.instructor": "Enseignant",
  "courses.viewCourse": "Voir le cours",
  "courses.lesson": "le\u00e7on",
  "courses.lessons": "le\u00e7ons",
  "courses.preview": "Aper\u00e7u",
  "courses.students": "\u00e9tudiants",
  "courses.createdBy": "Cr\u00e9\u00e9 par",
  "courses.sections": "sections",
  "courses.total": "au total",
  "courses.whatYouWillLearn": "Ce que vous allez apprendre",
  "courses.courseContent": "Contenu du cours",
  "courses.noContent": "Aucun contenu pour le moment.",
  "courses.description": "Description",
  "courses.yourInstructor": "Votre enseignant",
  "courses.studentReviews": "Avis des \u00e9tudiants",
  "courses.notFound": "Cours introuvable.",
  "courses.backToCatalog": "Retour au catalogue",
  "courses.continueCourse": "Continuer le cours",
  "courses.enrolling": "Inscription...",
  "courses.buyCourse": "Acheter ce cours",
  "courses.enrollFree": "S'inscrire gratuitement",
  "courses.guarantee":
    "Garantie satisfait ou rembours\u00e9 de 30 jours",
  "courses.unlimitedAccess": "Acc\u00e8s illimit\u00e9",
  "courses.privateCommunity": "Communaut\u00e9 priv\u00e9e",
  "courses.certificate": "Certificat de fin",
  "courses.inFavorites": "Dans vos favoris",
  "courses.addToFavorites": "Ajouter aux favoris",
  "courses.removedFromFavorites": "Retir\u00e9 des favoris",
  "courses.addedToFavorites": "Ajout\u00e9 aux favoris",
  "courses.enrolledSuccess": "Inscrit avec succ\u00e8s !",
  "courses.enrollError": "Erreur lors de l'inscription",

  // Auth
  "auth.login": "Connexion",
  "auth.loginSubtitle": "Heureux de vous revoir sur Khatantan",
  "auth.email": "Email",
  "auth.emailPlaceholder": "vous@exemple.com",
  "auth.password": "Mot de passe",
  "auth.rememberMe": "Se souvenir de moi",
  "auth.forgotPassword": "Mot de passe oubli\u00e9 ?",
  "auth.loggingIn": "Connexion...",
  "auth.loginButton": "Se connecter",
  "auth.noAccount": "Pas encore de compte ?",
  "auth.register": "S'inscrire",
  "auth.createAccount": "Cr\u00e9er un compte",
  "auth.registerSubtitle": "Rejoignez la communaut\u00e9 Khatantan",
  "auth.fullName": "Nom complet",
  "auth.namePlaceholder": "Jean Dupont",
  "auth.acceptTermsPre": "J'accepte les",
  "auth.acceptTermsPost": "et la politique de confidentialit\u00e9",
  "auth.registering": "Inscription...",
  "auth.registerButton": "S'inscrire",
  "auth.hasAccount": "D\u00e9j\u00e0 un compte ?",
  "auth.loginLink": "Se connecter",
  "auth.confirmEmailTitle": "V\u00e9rifiez votre bo\u00eete mail",
  "auth.confirmEmailMessage": "Un email de confirmation vient de vous \u00eatre envoy\u00e9. Cliquez sur le lien dans l'email pour activer votre compte.",
  "auth.confirmEmailOk": "Compris",

  // Dashboard
  "dashboard.hello": "Bonjour, {name} !",
  "dashboard.subtitle":
    "Pr\u00eat \u00e0 continuer votre apprentissage aujourd'hui ?",
  "dashboard.loyaltyProgram": "Programme de Fid\u00e9lit\u00e9",
  "dashboard.points": "points",
  "dashboard.coursesInProgress": "Cours en cours",
  "dashboard.learningThisMonth": "Apprentissage ce mois",
  "dashboard.myCourses": "Mes cours",
  "dashboard.noCourses":
    "Vous n'\u00eates inscrit \u00e0 aucun cours.",
  "dashboard.exploreCourses": "Explorer les cours",
  "dashboard.progress": "Progression :",
  "dashboard.continue": "Continuer",

  // Favorites
  "favorites.title": "Mes Favoris",
  "favorites.subtitle":
    "Retrouvez les cours que vous avez sauvegard\u00e9s.",
  "favorites.noFavorites": "Aucun favori",
  "favorites.noFavoritesSubtitle":
    "Ajoutez des cours \u00e0 vos favoris pour les retrouver ici.",
  "favorites.exploreCourses": "Explorer les cours",
  "favorites.viewCourse": "Voir le cours",

  // Reviews
  "reviews.yourReview": "Votre avis",
  "reviews.leaveReview": "Laisser un avis",
  "reviews.titlePlaceholder": "Titre (optionnel)",
  "reviews.bodyPlaceholder": "Votre avis...",
  "reviews.submitting": "Envoi...",
  "reviews.submit": "Publier l'avis",
  "reviews.updated": "Avis mis \u00e0 jour !",
  "reviews.thanks": "Merci pour votre avis !",
  "reviews.noReviews": "Aucun avis pour le moment.",
  "reviews.anonymous": "Anonyme",
  "reviews.instructorReply": "R\u00e9ponse de l'instructeur",

  // Common
  "common.loading": "Chargement...",
  "common.error": "Erreur",
};

const en: Translations = {
  // Nav
  "nav.home": "Home",
  "nav.courses": "Courses",
  "nav.about": "About",
  "nav.login": "Login",
  "nav.register": "Sign up",
  "nav.admin": "Administration",
  "nav.instructor": "Instructor Panel",
  "nav.student": "Student Area",
  "nav.instructorShort": "Instructor",
  "nav.studentShort": "Student",

  // Sidebar
  "sidebar.studentArea": "Student Area",
  "sidebar.dashboard": "Dashboard",
  "sidebar.myCourses": "My courses",
  "sidebar.favorites": "Favorites",
  "sidebar.settings": "Settings",
  "sidebar.logout": "Logout",
  "sidebar.menu": "Menu",
  "sidebar.instructorArea": "Instructor Panel",
  "sidebar.analytics": "Analytics",
  "sidebar.profile": "Profile",
  "sidebar.newCourse": "New course",
  "sidebar.admin": "Administration",
  "sidebar.users": "Users",
  "sidebar.courses": "Courses",
  "sidebar.categories": "Categories",
  "sidebar.badges": "Badges",

  // Footer
  "footer.description":
    "The learning platform dedicated to personal and spiritual development in Mongolia.",
  "footer.platform": "Platform",
  "footer.allCourses": "All courses",
  "footer.about": "About",
  "footer.pricing": "Pricing",
  "footer.support": "Support",
  "footer.contact": "Contact",
  "footer.terms": "Terms",
  "footer.faq": "FAQ",
  "footer.followUs": "Follow us",
  "footer.copyright": "All rights reserved.",

  // Home
  "home.heroTitle": "Awaken your spiritual and personal potential",
  "home.heroSubtitle":
    "The first online course marketplace in Mongolia dedicated to well-being, spirituality and personal development.",
  "home.discoverCourses": "Discover courses",
  "home.learnMore": "Learn more",
  "home.exploreCategories": "Explore by categories",
  "home.exploreCategoriesSubtitle":
    "Find the path that suits you among our varied themes.",
  "home.popularCourses": "Popular courses",
  "home.popularCoursesSubtitle":
    "The most popular courses from our community.",
  "home.viewAll": "View all",
  "home.viewAllCourses": "View all courses",
  "home.joinCommunity": "Join the Khatantan community",
  "home.joinCommunitySubtitle":
    "Subscribe to receive our wellness tips and be informed about new courses.",
  "home.emailPlaceholder": "Your email address",
  "home.subscribe": "Subscribe",

  // Courses
  "courses.allCourses": "All courses",
  "courses.sortPopularity": "Sort by: Popularity",
  "courses.sortPriceAsc": "Price: Low to High",
  "courses.sortPriceDesc": "Price: High to Low",
  "courses.filters": "Filters",
  "courses.search": "Search...",
  "courses.searchCourse": "Search a course...",
  "courses.level": "Level",
  "courses.beginner": "Beginner",
  "courses.intermediate": "Intermediate",
  "courses.advanced": "Advanced",
  "courses.allLevels": "All levels",
  "courses.price": "Price",
  "courses.free": "Free",
  "courses.paid": "Paid",
  "courses.filter": "Filter",
  "courses.noCourses": "No courses found.",
  "courses.instructor": "Instructor",
  "courses.viewCourse": "View course",
  "courses.lesson": "lesson",
  "courses.lessons": "lessons",
  "courses.preview": "Preview",
  "courses.students": "students",
  "courses.createdBy": "Created by",
  "courses.sections": "sections",
  "courses.total": "total",
  "courses.whatYouWillLearn": "What you will learn",
  "courses.courseContent": "Course content",
  "courses.noContent": "No content yet.",
  "courses.description": "Description",
  "courses.yourInstructor": "Your instructor",
  "courses.studentReviews": "Student reviews",
  "courses.notFound": "Course not found.",
  "courses.backToCatalog": "Back to catalog",
  "courses.continueCourse": "Continue course",
  "courses.enrolling": "Enrolling...",
  "courses.buyCourse": "Buy this course",
  "courses.enrollFree": "Enroll for free",
  "courses.guarantee": "30-day money-back guarantee",
  "courses.unlimitedAccess": "Unlimited access",
  "courses.privateCommunity": "Private community",
  "courses.certificate": "Completion certificate",
  "courses.inFavorites": "In your favorites",
  "courses.addToFavorites": "Add to favorites",
  "courses.removedFromFavorites": "Removed from favorites",
  "courses.addedToFavorites": "Added to favorites",
  "courses.enrolledSuccess": "Successfully enrolled!",
  "courses.enrollError": "Error during enrollment",

  // Auth
  "auth.login": "Login",
  "auth.loginSubtitle": "Welcome back to Khatantan",
  "auth.email": "Email",
  "auth.emailPlaceholder": "you@example.com",
  "auth.password": "Password",
  "auth.rememberMe": "Remember me",
  "auth.forgotPassword": "Forgot password?",
  "auth.loggingIn": "Logging in...",
  "auth.loginButton": "Log in",
  "auth.noAccount": "Don't have an account?",
  "auth.register": "Sign up",
  "auth.createAccount": "Create an account",
  "auth.registerSubtitle": "Join the Khatantan community",
  "auth.fullName": "Full name",
  "auth.namePlaceholder": "John Doe",
  "auth.acceptTermsPre": "I accept the",
  "auth.acceptTermsPost": "and the privacy policy",
  "auth.registering": "Signing up...",
  "auth.registerButton": "Sign up",
  "auth.hasAccount": "Already have an account?",
  "auth.loginLink": "Log in",
  "auth.confirmEmailTitle": "Check your inbox",
  "auth.confirmEmailMessage": "A confirmation email has been sent to you. Click the link in the email to activate your account.",
  "auth.confirmEmailOk": "Got it",

  // Dashboard
  "dashboard.hello": "Hello, {name}!",
  "dashboard.subtitle": "Ready to continue learning today?",
  "dashboard.loyaltyProgram": "Loyalty Program",
  "dashboard.points": "points",
  "dashboard.coursesInProgress": "Courses in progress",
  "dashboard.learningThisMonth": "Learning this month",
  "dashboard.myCourses": "My courses",
  "dashboard.noCourses": "You are not enrolled in any course.",
  "dashboard.exploreCourses": "Explore courses",
  "dashboard.progress": "Progress:",
  "dashboard.continue": "Continue",

  // Favorites
  "favorites.title": "My Favorites",
  "favorites.subtitle": "Find the courses you have saved.",
  "favorites.noFavorites": "No favorites",
  "favorites.noFavoritesSubtitle":
    "Add courses to your favorites to find them here.",
  "favorites.exploreCourses": "Explore courses",
  "favorites.viewCourse": "View course",

  // Reviews
  "reviews.yourReview": "Your review",
  "reviews.leaveReview": "Leave a review",
  "reviews.titlePlaceholder": "Title (optional)",
  "reviews.bodyPlaceholder": "Your review...",
  "reviews.submitting": "Sending...",
  "reviews.submit": "Publish review",
  "reviews.updated": "Review updated!",
  "reviews.thanks": "Thank you for your review!",
  "reviews.noReviews": "No reviews yet.",
  "reviews.anonymous": "Anonymous",
  "reviews.instructorReply": "Instructor reply",

  // Common
  "common.loading": "Loading...",
  "common.error": "Error",
};

const mn: Translations = {
  // Nav
  "nav.home": "\u041d\u04af\u04af\u0440",
  "nav.courses": "\u0425\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434",
  "nav.about": "\u0411\u0438\u0434\u043d\u0438\u0439 \u0442\u0443\u0445\u0430\u0439",
  "nav.login": "\u041d\u044d\u0432\u0442\u0440\u044d\u0445",
  "nav.register": "\u0411\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u0445",
  "nav.admin": "\u0423\u0434\u0438\u0440\u0434\u043b\u0430\u0433\u0430",
  "nav.instructor": "\u0411\u0430\u0433\u0448\u0438\u0439\u043d \u0431\u0443\u043b\u0430\u043d",
  "nav.student": "\u0421\u0443\u0440\u0430\u043b\u0446\u0430\u0433\u0447\u0438\u0439\u043d \u0431\u0443\u043b\u0430\u043d",
  "nav.instructorShort": "\u0411\u0430\u0433\u0448",
  "nav.studentShort": "\u0421\u0443\u0440\u0430\u043b\u0446\u0430\u0433\u0447",

  // Sidebar
  "sidebar.studentArea": "\u0421\u0443\u0440\u0430\u043b\u0446\u0430\u0433\u0447\u0438\u0439\u043d \u0431\u0443\u043b\u0430\u043d",
  "sidebar.dashboard": "\u0425\u044f\u043d\u0430\u0445 \u0441\u0430\u043c\u0431\u0430\u0440",
  "sidebar.myCourses": "\u041c\u0438\u043d\u0438\u0439 \u0445\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434",
  "sidebar.favorites": "\u0414\u0443\u0440\u0442\u0430\u0439",
  "sidebar.settings": "\u0422\u043e\u0445\u0438\u0440\u0433\u043e\u043e",
  "sidebar.logout": "\u0413\u0430\u0440\u0430\u0445",
  "sidebar.menu": "\u0426\u044d\u0441",
  "sidebar.instructorArea": "\u0411\u0430\u0433\u0448\u0438\u0439\u043d \u0431\u0443\u043b\u0430\u043d",
  "sidebar.analytics": "\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a",
  "sidebar.profile": "\u041f\u0440\u043e\u0444\u0430\u0439\u043b",
  "sidebar.newCourse": "\u0428\u0438\u043d\u044d \u0445\u0438\u0447\u044d\u044d\u043b",
  "sidebar.admin": "\u0423\u0434\u0438\u0440\u0434\u043b\u0430\u0433\u0430",
  "sidebar.users": "\u0425\u044d\u0440\u044d\u0433\u043b\u044d\u0433\u0447\u0438\u0434",
  "sidebar.courses": "\u0425\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434",
  "sidebar.categories": "\u0410\u043d\u0433\u0438\u043b\u0430\u043b",
  "sidebar.badges": "\u0428\u0430\u0433\u043d\u0430\u043b",

  // Footer
  "footer.description":
    "\u041c\u043e\u043d\u0433\u043e\u043b \u0434\u0430\u0445\u044c \u0445\u04af\u043d\u0438\u0439 \u0445\u04e9\u0433\u0436\u0438\u043b \u0431\u043e\u043b\u043e\u043d \u0441\u04af\u043d\u0441\u043b\u044d\u0433 \u0445\u04e9\u0433\u0436\u043b\u0438\u0439\u043d \u0441\u0443\u0440\u0433\u0430\u043b\u0442\u044b\u043d \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c.",
  "footer.platform": "\u041f\u043b\u0430\u0442\u0444\u043e\u0440\u043c",
  "footer.allCourses": "\u0411\u04af\u0445 \u0445\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434",
  "footer.about": "\u0411\u0438\u0434\u043d\u0438\u0439 \u0442\u0443\u0445\u0430\u0439",
  "footer.pricing": "\u04ae\u043d\u044d",
  "footer.support": "\u0422\u0443\u0441\u043b\u0430\u043c\u0436",
  "footer.contact": "\u0425\u043e\u043b\u0431\u043e\u043e \u0431\u0430\u0440\u0438\u0445",
  "footer.terms": "\u04ae\u0439\u043b\u0447\u0438\u043b\u0433\u044d\u044d\u043d\u0438\u0439 \u043d\u04e9\u0445\u0446\u04e9\u043b",
  "footer.faq": "\u0422\u04af\u0433\u044d\u044d\u043c\u044d\u043b \u0430\u0441\u0443\u0443\u043b\u0442\u0443\u0443\u0434",
  "footer.followUs": "\u0411\u0438\u0434\u043d\u0438\u0439\u0433 \u0434\u0430\u0433\u0430\u0430\u0440\u0430\u0439",
  "footer.copyright": "\u0411\u04af\u0445 \u044d\u0440\u0445 \u0445\u0430\u043c\u0433\u0430\u0430\u043b\u0430\u0433\u0434\u0441\u0430\u043d.",

  // Home
  "home.heroTitle":
    "\u0421\u04af\u043d\u0441\u043b\u044d\u0433 \u0431\u043e\u043b\u043e\u043d \u0445\u04af\u043d\u0438\u0439 \u0431\u043e\u043b\u043e\u043c\u0436\u043e\u043e \u0441\u044d\u0440\u044d\u044d\u0433\u044d\u044d\u0440\u044d\u0439",
  "home.heroSubtitle":
    "\u041c\u043e\u043d\u0433\u043e\u043b\u0434\u0430\u0445\u044c \u0441\u0430\u0439\u043d \u0441\u0430\u0439\u0445\u0430\u043d \u0431\u0430\u0439\u0434\u0430\u043b, \u0441\u04af\u043d\u0441\u043b\u044d\u0433 \u0431\u043e\u043b\u043e\u043d \u0445\u04af\u043d\u0438\u0439 \u0445\u04e9\u0433\u0436\u043b\u0438\u0439\u043d \u0430\u043d\u0445\u043d\u044b \u043e\u043d\u043b\u0430\u0439\u043d \u0441\u0443\u0440\u0433\u0430\u043b\u0442\u044b\u043d \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c.",
  "home.discoverCourses":
    "\u0425\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434\u0438\u0439\u0433 \u04af\u0437\u044d\u0445",
  "home.learnMore": "\u0414\u044d\u043b\u0433\u044d\u0440\u044d\u043d\u0433\u04af\u0439",
  "home.exploreCategories":
    "\u0410\u043d\u0433\u0438\u043b\u043b\u0430\u0430\u0440 \u0441\u0443\u0434\u043b\u0430\u0445",
  "home.exploreCategoriesSubtitle":
    "\u0422\u0430\u043d\u0434 \u0442\u043e\u0445\u0438\u0440\u0441\u043e\u043d \u0441\u044d\u0434\u0432\u0438\u0439\u0433 \u043e\u043b\u043e\u043e\u0440\u0430\u0439.",
  "home.popularCourses":
    "\u0410\u043b\u0434\u0430\u0440\u0442\u0430\u0439 \u0445\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434",
  "home.popularCoursesSubtitle":
    "\u041c\u0430\u043d\u0430\u0439 \u0445\u0430\u043c\u0442 \u043e\u043b\u043d\u044b \u0434\u0443\u043d\u0434 \u0445\u0430\u043c\u0433\u0438\u0439\u043d \u0438\u0445 \u0441\u043e\u043d\u0438\u0440\u0445\u043e\u043b \u0442\u0430\u0442\u0441\u0430\u043d \u0441\u0443\u0440\u0433\u0430\u043b\u0442\u0443\u0443\u0434.",
  "home.viewAll": "\u0411\u04af\u0433\u0434\u0438\u0439\u0433 \u0445\u0430\u0440\u0430\u0445",
  "home.viewAllCourses":
    "\u0411\u04af\u0445 \u0445\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434\u0438\u0439\u0433 \u0445\u0430\u0440\u0430\u0445",
  "home.joinCommunity":
    "Khatantan \u0445\u0430\u043c\u0442 \u043e\u043b\u043e\u043d\u0434 \u043d\u044d\u0433\u0434\u044d\u0445",
  "home.joinCommunitySubtitle":
    "\u0428\u0438\u043d\u044d \u0445\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434 \u0431\u043e\u043b\u043e\u043d \u0437\u04e9\u0432\u043b\u04e9\u0433\u04e9\u04e9 \u0430\u0432\u0430\u0445\u044b\u043d \u0442\u0443\u043b\u0434 \u0431\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u044d\u0440\u044d\u0439.",
  "home.emailPlaceholder":
    "\u0422\u0430\u043d\u044b \u0438-\u043c\u044d\u0439\u043b \u0445\u0430\u044f\u0433",
  "home.subscribe": "\u0411\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u0445",

  // Courses
  "courses.allCourses":
    "\u0411\u04af\u0445 \u0445\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434",
  "courses.sortPopularity":
    "\u042d\u0440\u044d\u043c\u0431\u044d\u043b\u044d\u0445: \u0410\u043b\u0434\u0430\u0440\u0442\u0430\u0439",
  "courses.sortPriceAsc":
    "\u04ae\u043d\u044d: \u04e8\u0441\u04e9\u0445 \u0434\u0430\u0440\u0430\u0430\u043b\u0430\u043b",
  "courses.sortPriceDesc":
    "\u04ae\u043d\u044d: \u0411\u0443\u0443\u0440\u0430\u0445 \u0434\u0430\u0440\u0430\u0430\u043b\u0430\u043b",
  "courses.filters": "\u0428\u04af\u04af\u043b\u0442\u04af\u04af\u0440",
  "courses.search": "\u0425\u0430\u0439\u0445...",
  "courses.searchCourse":
    "\u0425\u0438\u0447\u044d\u044d\u043b \u0445\u0430\u0439\u0445...",
  "courses.level": "\u0422\u04af\u0432\u0448\u0438\u043d",
  "courses.beginner": "\u0410\u043d\u0445\u0430\u043d \u0448\u0430\u0442",
  "courses.intermediate": "\u0414\u0443\u043d\u0434 \u0448\u0430\u0442",
  "courses.advanced": "\u0410\u0445\u0438\u0441\u0430\u043d \u0448\u0430\u0442",
  "courses.allLevels": "\u0411\u04af\u0445 \u0442\u04af\u0432\u0448\u0438\u043d",
  "courses.price": "\u04ae\u043d\u044d",
  "courses.free": "\u04ae\u043d\u044d\u0433\u04af\u0439",
  "courses.paid": "\u0422\u04e9\u043b\u0431\u04e9\u0440\u0442\u044d\u0439",
  "courses.filter": "\u0428\u04af\u04af\u0445",
  "courses.noCourses":
    "\u0425\u0438\u0447\u044d\u044d\u043b \u043e\u043b\u0434\u0441\u043e\u043d\u0433\u04af\u0439.",
  "courses.instructor": "\u0411\u0430\u0433\u0448",
  "courses.viewCourse":
    "\u0425\u0438\u0447\u044d\u044d\u043b \u04af\u0437\u044d\u0445",
  "courses.lesson": "\u0445\u0438\u0447\u044d\u044d\u043b",
  "courses.lessons": "\u0445\u0438\u0447\u044d\u044d\u043b",
  "courses.preview": "\u04ae\u0437\u044d\u0445",
  "courses.students":
    "\u0441\u0443\u0440\u0430\u043b\u0446\u0430\u0433\u0447",
  "courses.createdBy": "\u0417\u043e\u0445\u0438\u043e\u0433\u0447:",
  "courses.sections": "\u0431\u04af\u043b\u044d\u0433",
  "courses.total": "\u043d\u0438\u0439\u0442",
  "courses.whatYouWillLearn":
    "\u0422\u0430 \u044e\u0443 \u0441\u0443\u0440\u0430\u0445 \u0432\u044d",
  "courses.courseContent":
    "\u0425\u0438\u0447\u044d\u044d\u043b\u0438\u0439\u043d \u0430\u0433\u0443\u0443\u043b\u0433\u0430",
  "courses.noContent":
    "\u041e\u0434\u043e\u043e\u0445\u043e\u043d\u0434\u043e\u043e \u0430\u0433\u0443\u0443\u043b\u0433\u0430 \u0431\u0430\u0439\u0445\u0433\u04af\u0439.",
  "courses.description": "\u0422\u0430\u0439\u043b\u0431\u0430\u0440",
  "courses.yourInstructor":
    "\u0422\u0430\u043d\u044b \u0431\u0430\u0433\u0448",
  "courses.studentReviews":
    "\u0421\u0443\u0440\u0430\u043b\u0446\u0430\u0433\u0447\u0434\u044b\u043d \u0441\u044d\u0442\u0433\u044d\u0433\u0434\u044d\u043b",
  "courses.notFound":
    "\u0425\u0438\u0447\u044d\u044d\u043b \u043e\u043b\u0434\u0441\u043e\u043d\u0433\u04af\u0439.",
  "courses.backToCatalog":
    "\u041a\u0430\u0442\u0430\u043b\u043e\u0433 \u0440\u0443\u0443 \u0431\u0443\u0446\u0430\u0445",
  "courses.continueCourse":
    "\u04ae\u0440\u0433\u044d\u043b\u0436\u043b\u04af\u04af\u043b\u044d\u0445",
  "courses.enrolling":
    "\u0411\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u0436 \u0431\u0430\u0439\u043d\u0430...",
  "courses.buyCourse":
    "\u0425\u0438\u0447\u044d\u044d\u043b\u0438\u0439\u0433 \u0430\u0432\u0430\u0445",
  "courses.enrollFree":
    "\u04ae\u043d\u044d\u0433\u04af\u0439 \u0431\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u0445",
  "courses.guarantee":
    "30 \u0445\u043e\u043d\u043e\u0433\u0438\u0439\u043d \u0431\u0443\u0446\u0430\u0430\u043d \u043e\u043b\u0433\u043e\u043b\u0442\u044b\u043d \u0431\u0430\u0442\u0430\u043b\u0433\u0430\u0430",
  "courses.unlimitedAccess":
    "\u0425\u044f\u0437\u0433\u0430\u0430\u0440\u0433\u04af\u0439 \u0445\u0430\u043d\u0434\u0430\u043b\u0442",
  "courses.privateCommunity":
    "\u0425\u0430\u0430\u043b\u0442\u0442\u0430\u0439 \u0445\u0430\u043c\u0442 \u043e\u043b\u043e\u043d",
  "courses.certificate":
    "\u0422\u04e9\u0433\u0441\u04e9\u043b\u0442\u0438\u0439\u043d \u0433\u044d\u0440\u0447\u0438\u043b\u0433\u044d\u044d",
  "courses.inFavorites":
    "\u0414\u0443\u0440\u0442\u0430\u0439\u0434 \u0431\u0430\u0439\u0433\u0430\u0430",
  "courses.addToFavorites":
    "\u0414\u0443\u0440\u0442\u0430\u0439\u0434 \u043d\u044d\u043c\u044d\u0445",
  "courses.removedFromFavorites":
    "\u0414\u0443\u0440\u0442\u0430\u0439\u0433\u0430\u0430\u0441 \u0445\u0430\u0441\u0441\u0430\u043d",
  "courses.addedToFavorites":
    "\u0414\u0443\u0440\u0442\u0430\u0439\u0434 \u043d\u044d\u043c\u0441\u044d\u043d",
  "courses.enrolledSuccess":
    "\u0410\u043c\u0436\u0438\u043b\u0442\u0442\u0430\u0439 \u0431\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u043b\u044d\u044d!",
  "courses.enrollError":
    "\u0411\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u0445\u044d\u0434 \u0430\u043b\u0434\u0430\u0430 \u0433\u0430\u0440\u043b\u0430\u0430",

  // Auth
  "auth.login": "\u041d\u044d\u0432\u0442\u0440\u044d\u0445",
  "auth.loginSubtitle":
    "Khatantan-\u0434 \u0442\u0430\u0432\u0442\u0430\u0439 \u043c\u043e\u0440\u0438\u043b\u043e\u043e",
  "auth.email": "\u0418-\u043c\u044d\u0439\u043b",
  "auth.emailPlaceholder": "ta@zhishee.mn",
  "auth.password": "\u041d\u0443\u0443\u0446 \u04af\u0433",
  "auth.rememberMe": "\u041d\u0430\u043c\u0430\u0439\u0433 \u0441\u0430\u043d\u0430",
  "auth.forgotPassword":
    "\u041d\u0443\u0443\u0446 \u04af\u0433 \u043c\u0430\u0440\u0442\u0441\u0430\u043d?",
  "auth.loggingIn":
    "\u041d\u044d\u0432\u0442\u0440\u044d\u0436 \u0431\u0430\u0439\u043d\u0430...",
  "auth.loginButton": "\u041d\u044d\u0432\u0442\u0440\u044d\u0445",
  "auth.noAccount":
    "\u0411\u04af\u0440\u0442\u0433\u044d\u043b\u0433\u04af\u0439 \u044e\u0443?",
  "auth.register": "\u0411\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u0445",
  "auth.createAccount":
    "\u0428\u0438\u043d\u044d \u0431\u04af\u0440\u0442\u0433\u044d\u043b",
  "auth.registerSubtitle":
    "Khatantan \u0445\u0430\u043c\u0442 \u043e\u043b\u043e\u043d\u0434 \u043d\u044d\u0433\u0434\u044d\u044d\u0440\u044d\u0439",
  "auth.fullName":
    "\u0411\u04af\u0442\u044d\u043d \u043d\u044d\u0440",
  "auth.namePlaceholder":
    "\u0411\u0430\u0442 \u0414\u043e\u0440\u0436",
  "auth.acceptTermsPre": "\u0411\u0438",
  "auth.acceptTermsPost":
    "\u0431\u043e\u043b\u043e\u043d \u043d\u0443\u0443\u0446\u043b\u0430\u043b\u044b\u043d \u0431\u043e\u0434\u043b\u043e\u0433\u044b\u0433 \u0437\u04e9\u0432\u0448\u04e9\u04e9\u0440\u0447 \u0431\u0430\u0439\u043d\u0430",
  "auth.registering":
    "\u0411\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u0436 \u0431\u0430\u0439\u043d\u0430...",
  "auth.registerButton":
    "\u0411\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u0445",
  "auth.hasAccount":
    "\u0411\u04af\u0440\u0442\u0433\u044d\u043b\u0442\u044d\u0439 \u044e\u0443?",
  "auth.loginLink": "\u041d\u044d\u0432\u0442\u0440\u044d\u0445",
  "auth.confirmEmailTitle": "\u0418-\u043c\u044d\u0439\u043b\u044d\u044d \u0448\u0430\u043b\u0433\u0430\u043d\u0430 \u0443\u0443",
  "auth.confirmEmailMessage": "\u0411\u0430\u0442\u0430\u043b\u0433\u0430\u0430\u0436\u0443\u0443\u043b\u0430\u0445 \u0438-\u043c\u044d\u0439\u043b \u0438\u043b\u0433\u044d\u044d\u0433\u0434\u0441\u044d\u043d. \u0411\u04af\u0440\u0442\u0433\u044d\u043b\u044d\u044d \u0438\u0434\u044d\u0432\u0445\u0436\u04af\u04af\u043b\u044d\u0445\u0438\u0439\u043d \u0442\u0443\u043b\u0434 \u0438-\u043c\u044d\u0439\u043b \u0434\u044d\u0445 \u043b\u0438\u043d\u043a \u0434\u044d\u044d\u0440 \u0434\u0430\u0440\u043d\u0430 \u0443\u0443.",
  "auth.confirmEmailOk": "\u041e\u0439\u043b\u0433\u043e\u043b\u043e\u043e",

  // Dashboard
  "dashboard.hello": "\u0421\u0430\u0439\u043d \u0431\u0430\u0439\u043d\u0430 \u0443\u0443, {name}!",
  "dashboard.subtitle":
    "\u04e8\u043d\u04e9\u04e9\u0434\u04e9\u0440 \u0441\u0443\u0440\u0430\u043b\u0446\u0430\u0445\u0430\u0434 \u0431\u044d\u043b\u044d\u043d \u04af\u04af?",
  "dashboard.loyaltyProgram":
    "\u04ae\u043d\u044d\u043d\u0447 \u0445\u04e9\u0442\u04e9\u043b\u0431\u04e9\u0440",
  "dashboard.points": "\u043e\u043d\u043e\u043e",
  "dashboard.coursesInProgress":
    "\u042f\u0432\u0430\u0433\u0434\u0430\u0436 \u0431\u0430\u0439\u0433\u0430\u0430 \u0445\u0438\u0447\u044d\u044d\u043b",
  "dashboard.learningThisMonth":
    "\u042d\u043d\u044d \u0441\u0430\u0440\u044b\u043d \u0441\u0443\u0440\u0433\u0430\u043b\u0442",
  "dashboard.myCourses":
    "\u041c\u0438\u043d\u0438\u0439 \u0445\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434",
  "dashboard.noCourses":
    "\u0422\u0430 \u044f\u043c\u0430\u0440 \u0447 \u0445\u0438\u0447\u044d\u044d\u043b\u0434 \u0431\u04af\u0440\u0442\u0433\u04af\u04af\u043b\u044d\u044d\u0433\u04af\u0439 \u0431\u0430\u0439\u043d\u0430.",
  "dashboard.exploreCourses":
    "\u0425\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434 \u04af\u0437\u044d\u0445",
  "dashboard.progress":
    "\u042f\u0432\u0446:",
  "dashboard.continue":
    "\u04ae\u0440\u0433\u044d\u043b\u0436\u043b\u04af\u04af\u043b\u044d\u0445",

  // Favorites
  "favorites.title":
    "\u041c\u0438\u043d\u0438\u0439 \u0434\u0443\u0440\u0442\u0430\u0439",
  "favorites.subtitle":
    "\u0425\u0430\u0434\u0433\u0430\u043b\u0441\u0430\u043d \u0445\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434\u044d\u044d \u044d\u043d\u0434\u044d\u044d\u0441 \u043e\u043b\u043e\u043e\u0440\u0430\u0439.",
  "favorites.noFavorites":
    "\u0414\u0443\u0440\u0442\u0430\u0439 \u0431\u0430\u0439\u0445\u0433\u04af\u0439",
  "favorites.noFavoritesSubtitle":
    "\u0425\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434\u0438\u0439\u0433 \u0434\u0443\u0440\u0442\u0430\u0439\u0434\u0430\u0430 \u043d\u044d\u043c\u044d\u044d\u0440\u044d\u0439.",
  "favorites.exploreCourses":
    "\u0425\u0438\u0447\u044d\u044d\u043b\u04af\u04af\u0434 \u04af\u0437\u044d\u0445",
  "favorites.viewCourse":
    "\u0425\u0438\u0447\u044d\u044d\u043b \u04af\u0437\u044d\u0445",

  // Reviews
  "reviews.yourReview":
    "\u0422\u0430\u043d\u044b \u0441\u044d\u0442\u0433\u044d\u0433\u0434\u044d\u043b",
  "reviews.leaveReview":
    "\u0421\u044d\u0442\u0433\u044d\u0433\u0434\u044d\u043b \u04af\u043b\u0434\u044d\u044d\u0445",
  "reviews.titlePlaceholder":
    "\u0413\u0430\u0440\u0447\u0438\u0433 (\u0441\u043e\u043d\u0433\u043e\u043d)",
  "reviews.bodyPlaceholder":
    "\u0422\u0430\u043d\u044b \u0441\u044d\u0442\u0433\u044d\u0433\u0434\u044d\u043b...",
  "reviews.submitting":
    "\u0418\u043b\u0433\u044d\u044d\u0436 \u0431\u0430\u0439\u043d\u0430...",
  "reviews.submit":
    "\u041d\u0438\u0439\u0442\u043b\u044d\u0445",
  "reviews.updated":
    "\u0421\u044d\u0442\u0433\u044d\u0433\u0434\u044d\u043b \u0448\u0438\u043d\u044d\u0447\u043b\u044d\u0433\u0434\u043b\u044d\u044d!",
  "reviews.thanks":
    "\u0421\u044d\u0442\u0433\u044d\u0433\u0434\u044d\u043b\u0434 \u0431\u0430\u044f\u0440\u043b\u0430\u043b\u0430\u0430!",
  "reviews.noReviews":
    "\u041e\u0434\u043e\u043e\u0445\u043e\u043d\u0434\u043e\u043e \u0441\u044d\u0442\u0433\u044d\u0433\u0434\u044d\u043b \u0431\u0430\u0439\u0445\u0433\u04af\u0439.",
  "reviews.anonymous":
    "\u041d\u044d\u0440\u0433\u04af\u0439",
  "reviews.instructorReply":
    "\u0411\u0430\u0433\u0448\u0438\u0439\u043d \u0445\u0430\u0440\u0438\u0443",

  // Common
  "common.loading":
    "\u0410\u0447\u0430\u0430\u043b\u0436 \u0431\u0430\u0439\u043d\u0430...",
  "common.error": "\u0410\u043b\u0434\u0430\u0430",
};

export const translations: Record<Locale, Translations> = { fr, en, mn };
