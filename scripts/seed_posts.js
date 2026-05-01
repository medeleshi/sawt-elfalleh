const { createClient } = require('@supabase/supabase-js');
// dotenv is handled by --env-file flag

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const USERS = {
  citizen: 'ccc95f37-08e1-4cd8-93f2-982e4cfc77fd',
  farmer: '4f68dc37-500d-4e96-9d1b-a4bcfb47e909',
  trader: '555c0be7-d197-4221-bb01-f56d2988f7b6'
};

const SEED_POSTS = [
  // FARMER POSTS (Selling produce)
  {
    userRole: 'farmer',
    type: 'sell',
    title: 'طماطم فصلية للبيع بالجملة',
    description: 'طماطم فصلية ذات جودة عالية، متوفرة بكميات كبيرة من المزرعة مباشرة. مثالية للتجار والمصانع.',
    quantity: 5000,
    price: 0.8, // 800 millimes per kg
    is_negotiable: true,
    imageKeywords: ['tomatoes', 'agriculture'],
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80'
  },
  {
    userRole: 'farmer',
    type: 'sell',
    title: 'زيت زيتون بكر ممتاز',
    description: 'زيت زيتون بكر ممتاز عصرة أولى باردة. الحموضة أقل من 0.5%. متوفر في عبوات 5 لتر.',
    quantity: 200,
    price: 25.0, // 25 TND per liter
    is_negotiable: false,
    imageKeywords: ['olive oil', 'bottle'],
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80'
  },
  {
    userRole: 'farmer',
    type: 'sell',
    title: 'قمح صلب من إنتاج باجة',
    description: 'قمح صلب ممتاز من السنابل الذهبية بمنطقة باجة. خالي من الشوائب ومخزن بعناية.',
    quantity: 10000,
    price: 1.2, // 1.2 TND per kg
    is_negotiable: true,
    imageKeywords: ['wheat', 'grain'],
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80'
  },

  // TRADER POSTS (Buying produce, Selling equipment)
  {
    userRole: 'trader',
    type: 'buy',
    title: 'شراء تمور دقلة نور للتصدير',
    description: 'مطلوب كميات كبيرة من تمور دقلة نور عالية الجودة ومطابقة لمواصفات التصدير.',
    quantity: 20000,
    price: 6.5, // Target price 6.5 TND
    is_negotiable: true,
    imageKeywords: ['dates', 'fruit'],
    imageUrl: 'https://images.unsplash.com/photo-1596231920808-16e788bc5397?w=800&q=80'
  },
  {
    userRole: 'trader',
    type: 'sell',
    title: 'جرار فلاحي مستعمل بحالة جيدة',
    description: 'جرار فلاحي قوي مستعمل لمدة 3 سنوات فقط. تمت الصيانة بالكامل ومستعد للعمل الفوري.',
    quantity: 1,
    price: 45000, // 45,000 TND
    is_negotiable: true,
    imageKeywords: ['tractor', 'farm'],
    imageUrl: 'https://images.unsplash.com/photo-1560278144-8848c26bb5c7?w=800&q=80'
  },

  // CITIZEN POSTS (Buying small quantities)
  {
    userRole: 'citizen',
    type: 'buy',
    title: 'مطلوب عسل حر طبيعي للاستهلاك',
    description: 'أبحث عن عسل نحل طبيعي أصلي (إكليل أو زعتر) للاستهلاك العائلي، يفضل من مربي نحل موثوق.',
    quantity: 5,
    price: 40.0, // 40 TND per kg
    is_negotiable: false,
    imageKeywords: ['honey', 'jar'],
    imageUrl: 'https://images.unsplash.com/photo-1587049352847-4d4b1263d596?w=800&q=80'
  },
  {
    userRole: 'citizen',
    type: 'buy',
    title: 'زيت زيتون لعولة الشتاء',
    description: 'أبحث عن زيت زيتون ذو جودة جيدة لعائلة. أرغب في شراء حوالي 50 لتر.',
    quantity: 50,
    price: 22.0, // target 22 TND
    is_negotiable: true,
    imageKeywords: ['olive oil'],
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80'
  }
];

async function seed() {
  console.log('Fetching dependencies (categories, units, regions)...');
  
  const { data: categories } = await supabase.from('categories').select('id, name_ar');
  const { data: units } = await supabase.from('units').select('id, name_ar');
  const { data: regions } = await supabase.from('regions').select('id, name_ar');

  if (!categories?.length || !units?.length || !regions?.length) {
    console.error('Missing fundamental data in DB. Run basic seeds first.');
    process.exit(1);
  }

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  // Set expiry to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  console.log('Inserting seed posts...');
  
  for (const postDef of SEED_POSTS) {
    // Pick random category, unit, and region for simplicity
    // In a highly realistic scenario, we'd match categories explicitly, but random is fine for visual seeds
    const category = getRandomItem(categories);
    const unit = getRandomItem(units);
    const region = getRandomItem(regions);
    
    const userId = USERS[postDef.userRole];

    const postData = {
      user_id: userId,
      type: postDef.type,
      category_id: category.id,
      title: postDef.title,
      description: postDef.description,
      quantity: postDef.quantity,
      unit_id: unit.id,
      price: postDef.price,
      is_negotiable: postDef.is_negotiable,
      region_id: region.id,
      city: 'مدينة عشوائية', // Random city
      status: 'active',
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertedPost, error: postError } = await supabase
      .from('posts')
      .insert(postData)
      .select('id')
      .single();

    if (postError) {
      console.error(`Error inserting post "${postDef.title}":`, postError.message);
      continue;
    }

    // Insert the image
    const { error: imageError } = await supabase
      .from('post_images')
      .insert({
        post_id: insertedPost.id,
        url: postDef.imageUrl,
        storage_path: 'external', // Indicates it's not stored in our bucket
        sort_order: 1
      });

    if (imageError) {
      console.error(`Error inserting image for post "${postDef.title}":`, imageError.message);
    } else {
      console.log(`Successfully seeded post: "${postDef.title}" by ${postDef.userRole}`);
    }
  }

  console.log('\nSeeding completed!');
}

seed();
