import { fal } from "@fal-ai/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const courses = [
  {
    slug: "meditation-debutants-21-jours",
    prompt:
      "Peaceful meditation scene, a person meditating in lotus position at sunrise, soft golden bokeh light, zen garden with smooth stones and water, warm rose and amber tones, serene atmosphere, minimalist composition, professional photography, course thumbnail",
  },
  {
    slug: "yoga-vinyasa-flow",
    prompt:
      "Dynamic yoga vinyasa flow, a woman in warrior pose silhouette against a vibrant sunset sky, outdoor wooden deck overlooking mountains, flowing movement captured beautifully, warm orange purple gradient sky, inspiring and energetic, professional photography, course thumbnail",
  },
  {
    slug: "confiance-en-soi-programme-complet",
    prompt:
      "Empowering personal development concept, a confident person standing tall on a cliff edge overlooking a vast beautiful landscape at golden hour, arms slightly open, powerful and inspiring atmosphere, warm light, motivational feeling, professional photography, course thumbnail",
  },
  {
    slug: "introduction-chamanisme-mongol",
    prompt:
      "Mongolian shamanism scene, a traditional shaman drum with colorful ribbons near an ovoo cairn on the vast Mongolian steppe, dramatic sky with clouds, prayer flags, sacred atmosphere, warm earthy tones, mystical and cultural, professional photography, course thumbnail",
  },
  {
    slug: "reiki-niveau-1-eveil-energie",
    prompt:
      "Reiki energy healing, two hands with soft glowing warm light between palms, close-up shot, ethereal energy flowing, crystals and candles softly blurred in background, warm amber and golden tones, peaceful and sacred atmosphere, professional photography, course thumbnail",
  },
  {
    slug: "alimentation-pleine-conscience",
    prompt:
      "Mindful eating concept, beautiful overhead shot of a colorful healthy meal on a ceramic plate, fresh vegetables fruits and herbs, natural sunlight streaming through a window, rustic wooden table, warm inviting atmosphere, food photography, course thumbnail",
  },
];

async function main() {
  console.log("=== Khatantan — Thumbnails des cours ===\n");

  for (const course of courses) {
    console.log(`\u{1F3AC} ${course.slug}`);
    console.log("  \u2192 Generation avec Flux...");

    try {
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: course.prompt,
          image_size: "landscape_16_9",
          num_images: 1,
        },
      });

      const imageUrl = result.data.images[0].url;
      console.log(`  \u2713 Image: ${imageUrl}`);

      // Update course in database
      const { error } = await supabase
        .from("courses")
        .update({ thumbnail_url: imageUrl })
        .eq("slug", course.slug);

      if (error) {
        console.error(`  \u2717 Erreur DB: ${error.message}`);
      } else {
        console.log(`  \u2713 Base mise a jour\n`);
      }
    } catch (err) {
      console.error(`  \u2717 Erreur: ${err.message}\n`);
    }
  }

  console.log("=== Termine ! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
