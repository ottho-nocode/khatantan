import { fal } from "@fal-ai/client";

// --- Categories for wellness/spirituality LMS ---
const categories = [
  {
    name: "Méditation & Pleine Conscience",
    slug: "meditation",
    description: "Apprenez à calmer votre esprit et développer la pleine conscience au quotidien.",
    icon: "brain",
    position: 1,
    prompt: "Serene meditation scene, a person sitting in lotus position on a mountain top at sunrise, soft golden light, misty Mongolian steppe landscape in the background, peaceful atmosphere, spiritual, warm colors, cinematic photography",
  },
  {
    name: "Yoga & Mouvement",
    slug: "yoga",
    description: "Explorez les pratiques corporelles pour renforcer corps et esprit.",
    icon: "stretch-horizontal",
    position: 2,
    prompt: "Elegant yoga pose silhouette against a stunning sunset, outdoor practice on a wooden deck, Mongolian nature backdrop with rolling green hills, warm orange and purple sky, peaceful and inspiring, professional photography",
  },
  {
    name: "Développement Personnel",
    slug: "developpement-personnel",
    description: "Libérez votre potentiel et transformez votre vie avec des outils pratiques.",
    icon: "rocket",
    position: 3,
    prompt: "Inspiring personal growth concept, a person standing on top of a mountain with arms wide open, looking at a vast landscape, golden hour light, motivational and empowering atmosphere, Mongolian vast steppe, cinematic shot",
  },
  {
    name: "Spiritualité",
    slug: "spiritualite",
    description: "Explorez les traditions spirituelles et approfondissez votre connexion intérieure.",
    icon: "sparkles",
    position: 4,
    prompt: "Spiritual scene with a traditional Mongolian Buddhist temple, prayer flags flowing in the wind, soft ethereal light, incense smoke, sacred atmosphere, warm golden tones, peaceful and mystical, beautiful photography",
  },
  {
    name: "Bien-être & Santé",
    slug: "bien-etre",
    description: "Prenez soin de votre santé globale avec des approches naturelles et holistiques.",
    icon: "heart-pulse",
    position: 5,
    prompt: "Wellness and health concept, natural spa setting with hot stones, herbs, essential oils, soft natural light, warm earth tones, relaxing and rejuvenating atmosphere, beautiful arrangement, professional photography",
  },
  {
    name: "Guérison Holistique",
    slug: "guerison-holistique",
    description: "Découvrez les méthodes de guérison traditionnelles et alternatives.",
    icon: "hand-heart",
    position: 6,
    prompt: "Holistic healing scene, hands performing energy healing with soft glowing light between palms, crystals and natural elements around, warm amber lighting, sacred and peaceful atmosphere, close-up professional photography",
  },
  {
    name: "Arts Énergétiques",
    slug: "arts-energetiques",
    description: "Pratiquez le Qi Gong, le Tai Chi et d'autres arts pour harmoniser votre énergie vitale.",
    icon: "zap",
    position: 7,
    prompt: "Tai Chi practice at dawn in a beautiful garden, flowing movement captured in motion, soft morning mist, traditional clothing, serene and powerful atmosphere, Mongolian landscape, golden hour light, cinematic photography",
  },
  {
    name: "Nutrition Consciente",
    slug: "nutrition-consciente",
    description: "Adoptez une alimentation saine et en harmonie avec votre corps.",
    icon: "apple",
    position: 8,
    prompt: "Beautiful arrangement of colorful healthy foods, fresh fruits vegetables herbs and spices on a rustic wooden table, natural light from a window, warm and inviting atmosphere, Mongolian traditional healthy ingredients, food photography",
  },
];

// --- Main ---
async function main() {
  console.log("=== Khatantan — Génération des images de catégories ===\n");

  const results = [];

  for (const category of categories) {
    console.log(`📂 ${category.name}`);
    console.log("  → Génération de l'image avec Flux...");

    try {
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: category.prompt,
          image_size: "square_hd",
          num_images: 1,
        },
      });

      const imageUrl = result.data.images[0].url;
      console.log(`  ✓ ${imageUrl}\n`);

      results.push({ ...category, thumbnail_url: imageUrl });
    } catch (err) {
      console.error(`  ✗ Erreur: ${err.message}\n`);
      results.push({ ...category, thumbnail_url: null });
    }
  }

  // Generate SQL
  console.log("\n=== SQL à exécuter dans le Supabase SQL Editor ===\n");
  console.log("-- Supprimer les anciennes catégories");
  console.log("DELETE FROM public.categories;\n");
  console.log("-- Insérer les nouvelles catégories avec images");

  for (const cat of results) {
    const esc = (s) => s?.replace(/'/g, "''") ?? "";
    console.log(
      `INSERT INTO public.categories (name, slug, description, icon, position, thumbnail_url) VALUES ('${esc(cat.name)}', '${esc(cat.slug)}', '${esc(cat.description)}', '${esc(cat.icon)}', ${cat.position}, ${cat.thumbnail_url ? `'${cat.thumbnail_url}'` : "NULL"});`
    );
  }

  console.log("\n=== Terminé ! Copie le SQL ci-dessus dans le Supabase SQL Editor ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
