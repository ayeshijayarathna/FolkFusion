import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Palette, ArrowRight, Sparkles, Search, X, MapPin, History, Layers, Package, ArrowUpRight } from 'lucide-react';
import { artworkAPI } from '../../../services/api';

const CATEGORY_DETAILS = {
  'Folk Mural Painting': {
    image: '/images/heritage.jpg',
    description: 'Traditional Sri Lankan mural paintings adorning temple walls and ancient structures, depicting religious narratives, local folklore, and historical events through vibrant natural pigments.',
    history: 'Dating back to ancient kingdoms, folk mural painting flourished during the Anuradhapura and Polonnaruwa periods. These paintings served as visual storytelling tools, preserving Buddhist teachings and cultural heritage.',
    techniques: ['Natural pigment preparation', 'Wall surface treatment', 'Sketch outlining', 'Layer-by-layer coloring', 'Final detailing and preservation'],
    regions: ['Kandy', 'Gampaha', 'Colombo'],
    materials: 'Natural earth pigments, lime plaster, vegetable dyes, binding agents from plant resins',
  },
  'Pottery & Clay': {
    image: '/images/Neutral.jpg',
    description: 'Ancient Sri Lankan pottery traditions shaped by hand and fired in traditional kilns, producing functional earthenware and decorative pieces that have served communities for millennia.',
    history: 'Pottery in Sri Lanka dates back over 2,500 years, with archaeological evidence from Anuradhapura showing sophisticated pottery techniques. Village potters (kumbhal) have passed down their craft through generations.',
    techniques: ['Clay preparation and wedging', 'Hand-building or wheel-throwing', 'Surface decoration', 'Sun drying', 'Kiln firing at high temperatures'],
    regions: ['Matale', 'Kurunegala', 'Anuradhapura'],
    materials: 'Local clay deposits, natural glazes, wood ash, mineral oxides for coloring',
  },
  'Traditional Masks': {
    image: '/images/tmask.jpg',
    description: 'Ceremonial masks carved from kaduru wood, used in healing rituals, devil-dancing ceremonies, and traditional theater performances across Sri Lanka.',
    history: 'Mask-making tradition emerged from ancient exorcism rituals and folk healing practices. Each mask represents specific demons, animals, or characters from folklore, serving both spiritual and theatrical purposes.',
    techniques: ['Wood selection and seasoning', 'Carving with traditional chisels', 'Surface smoothing', 'Natural paint application', 'Final embellishment'],
    regions: ['Ambalangoda', 'Bentota', 'Galle'],
    materials: 'Kaduru (Nux vomica) wood, natural dyes, paint pigments, varnish from tree resins',
  },
  'Handloom Saree': {
    image: '/images/handloomS.jpg',
    description: 'Hand-woven silk and cotton sarees crafted on traditional wooden looms, celebrated for their intricate geometric patterns, vibrant colors, and rich cultural heritage.',
    history: 'Handloom weaving has been practiced in Sri Lanka for over 1,000 years. Royal patronage during the Kandyan Kingdom elevated it to a fine art, with specific patterns reserved for nobility.',
    techniques: ['Thread preparation and dyeing', 'Warp setting on loom', 'Pattern design planning', 'Shuttle weaving', 'Border and pallu creation'],
    regions: ['Kandy', 'Matale', 'Kurunegala'],
    materials: 'Cotton yarn, silk threads, natural dyes from plants and minerals, traditional wooden looms',
  },
  'Wood Carving': {
    image: '/images/woodcraving.jpg',
    description: 'Masterful woodwork depicting mythological figures, floral patterns, and wildlife — a hallmark of Sri Lankan temple architecture and decorative arts.',
    history: 'Wood carving reached its zenith during the Kandyan period (1469-1815), adorning palaces, temples, and aristocratic homes. Master craftsmen created intricate panels telling stories from Buddhist Jataka tales.',
    techniques: ['Wood selection and preparation', 'Design sketching', 'Relief carving', 'Detailed sculpting', 'Polishing and finishing'],
    regions: ['Kandy', 'Gampaha', 'Kegalle'],
    materials: 'Teak, ebony, jackfruit wood, traditional chisels and gouges, natural oils for finishing',
  },
  'Lacquer Work': {
    image: '/images/lacquerwork.jpg',
    description: 'Intricate hand-painted wooden crafts passed down through generations, known for their vivid colors, ornate floral patterns, and glossy lacquer finish.',
    history: 'Introduced during ancient trade routes with India and China, lacquer work became a distinctive Sri Lankan craft. Artisans in specific villages developed unique styles and color palettes.',
    techniques: ['Wood turning on traditional lathe', 'Multiple lacquer coats application', 'Pattern engraving', 'Color filling', 'Polishing for glossy finish'],
    regions: ['Matale', 'Kurunegala', 'Kandy'],
    materials: 'Halmilla wood, natural lac resin, mineral pigments, traditional turning lathes',
  },
  'Coconut Crafts': {
    image: '/images/coco.jpg',
    description: 'Utilitarian and decorative items crafted from coconut shells, husks, and leaves — demonstrating resourceful use of this abundant tropical material.',
    history: 'Coconut craft developed as a sustainable industry utilizing every part of the coconut palm. Coastal and rural communities perfected techniques to create durable household items and decorative pieces.',
    techniques: ['Shell cleaning and shaping', 'Carving and etching', 'Polishing', 'Coir rope making', 'Leaf weaving'],
    regions: ['Colombo', 'Gampaha', 'Kalutara'],
    materials: 'Coconut shells, husks, palm leaves, natural polishes, carving tools',
  },
  'Metal Craft': {
    image: '/images/metal.jpg',
    description: 'Traditional metalworking including brass, copper, and silver items — from ceremonial oil lamps to intricate jewelry and decorative household objects.',
    history: 'Sri Lankan metal craft dates to the ancient kingdoms, with archaeological evidence of sophisticated bronze and iron working. Royal patronage sustained the creation of ceremonial objects and temple adornments.',
    techniques: ['Metal sheet preparation', 'Repoussé hammering', 'Chasing and engraving', 'Casting in sand molds', 'Polishing and patina application'],
    regions: ['Kandy', 'Colombo', 'Galle'],
    materials: 'Brass, copper, silver, bronze, traditional hammers and stakes, acid solutions for patina',
  },
  'Cane Work': {
    image: '/images/cane.jpg',
    description: 'Woven furniture and decorative items created from rattan cane, showcasing intricate weaving patterns and structural craftsmanship.',
    history: 'Cane weaving became popular during the colonial period, blending local weaving techniques with European furniture styles. Villages specialized in creating distinctive patterns and forms.',
    techniques: ['Cane selection and soaking', 'Frame construction', 'Pattern weaving', 'Binding and securing', 'Finishing and varnishing'],
    regions: ['Kandy', 'Gampaha', 'Matale'],
    materials: 'Rattan cane, bamboo frames, natural varnishes, weaving tools',
  },
  'Statues': {
    image: '/images/stonestatus.jpg',
    description: 'Religious and decorative sculptures carved from stone, wood, or cast in bronze — representing Buddhist deities, mythological figures, and cultural icons.',
    history: 'Statue-making in Sri Lanka has ancient roots, with masterpieces like the Aukana Buddha (5th century) demonstrating advanced sculptural knowledge. Both religious and secular traditions continue today.',
    techniques: ['Material selection', 'Proportioning according to traditional canons', 'Rough shaping', 'Detail carving', 'Surface treatment and consecration'],
    regions: ['Anuradhapura', 'Polonnaruwa', 'Kandy'],
    materials: 'Granite, sandstone, teak wood, bronze, traditional chisels and mallets',
  },
  'Folk Jewelry': {
    image: '/images/jewl.jpg',
    description: 'Traditional ornaments crafted from silver, gold, and semi-precious stones, incorporating ancient designs passed through generations of jewelry artisans.',
    history: 'Sri Lankan jewelry craft reflects influences from South Indian, Portuguese, and local traditions. Royal jewelers created elaborate pieces for ceremonial occasions, while village artisans made everyday adornments.',
    techniques: ['Metal wire drawing', 'Granulation and filigree work', 'Stone setting', 'Repoussé embossing', 'Oxidation and polishing'],
    regions: ['Kandy', 'Colombo', 'Galle'],
    materials: 'Silver, gold, copper alloy, semi-precious stones, traditional hand tools',
  },
  'Ceramic': {
    image: '/images/cermic.jpg',
    description: 'High-fired ceramic ware including tableware, decorative pieces, and architectural elements, showcasing glazing techniques and artistic expression.',
    history: 'While pottery is ancient, modern ceramic techniques developed in the 20th century, blending traditional forms with contemporary glazing and firing methods.',
    techniques: ['Clay body preparation', 'Wheel throwing or molding', 'Bisque firing', 'Glaze application', 'Final high-temperature firing'],
    regions: ['Colombo', 'Gampaha', 'Kalutara'],
    materials: 'Kaolin clay, feldspar, silica, ceramic glazes, electric or gas kilns',
  },
  'Sri Lankan Sculpture': {
    image: '/images/sculpture.jpg',
    description: 'Contemporary and traditional three-dimensional art forms, ranging from abstract modern pieces to classical figurative works rooted in Buddhist iconography.',
    history: 'Sri Lankan sculpture evolved from ancient rock carvings to sophisticated temple art and modern abstract forms, maintaining connections to traditional symbolism while embracing contemporary expressions.',
    techniques: ['Conceptual design', 'Armature construction', 'Material shaping', 'Surface treatment', 'Finishing and installation'],
    regions: ['Colombo', 'Kandy', 'Galle'],
    materials: 'Stone, wood, metal, clay, modern casting materials, traditional and contemporary tools',
  },
  'Batik Clothing': {
    image: '/images/batikclothing.jpg',
    description: 'Wax-resist dyed fabrics creating intricate patterns on cotton and silk garments, representing a fusion of Indonesian technique and Sri Lankan aesthetic.',
    history: 'Introduced in the 1960s, batik quickly became a signature Sri Lankan craft. Local artisans developed distinctive styles, incorporating traditional motifs and vibrant tropical colors.',
    techniques: ['Design sketching on fabric', 'Wax application with tjanting', 'Dye immersion', 'Wax removal', 'Multiple color layering'],
    regions: ['Colombo', 'Galle', 'Matara'],
    materials: 'Cotton or silk fabric, beeswax, paraffin, fabric dyes, tjanting tools, stretching frames',
  },
  'Hana Fiber Crafts': {
    image: '/images/hanacraft.jpg',
    description: 'Woven items created from hana (a type of reed), including mats, baskets, and decorative pieces showcasing intricate weaving patterns.',
    history: 'Hana weaving is a traditional village craft, with techniques passed through matrilineal lines. Each region developed signature patterns and color combinations.',
    techniques: ['Reed harvesting and preparation', 'Dyeing in natural colors', 'Pattern planning', 'Weaving on simple looms', 'Edge finishing'],
    regions: ['Puttalam', 'Anuradhapura', 'Trincomalee'],
    materials: 'Hana reeds, natural dyes, simple weaving frames',
  },
  'Mats': {
    image: '/images/mats.jpg',
    description: 'Handwoven mats from various natural fibers including dumbara (reed), serving functional and ceremonial purposes in Sri Lankan households.',
    history: 'Mat weaving is one of the oldest crafts in Sri Lanka, with different communities specializing in specific materials and techniques. Dumbara mats from Kandy are particularly renowned.',
    techniques: ['Fiber preparation and softening', 'Natural dyeing', 'Weaving in geometric patterns', 'Border creation', 'Final treatment'],
    regions: ['Kandy', 'Matale', 'Kurunegala'],
    materials: 'Dumbara reeds, palm leaves, natural dyes, weaving needles',
  },
  'Puppetry': {
    image: '/images/pupperty.jpg',
    description: 'Traditional puppet-making and puppetry performance art, featuring elaborately dressed figures operated by skilled puppeteers telling folk tales and moral stories.',
    history: 'Rukada (puppet theater) emerged from folk storytelling traditions, with roots in Indian and Southeast Asian puppet traditions. Performed at temple festivals and village celebrations.',
    techniques: ['Wooden frame construction', 'Joint articulation', 'Costume creation', 'Face painting', 'String attachment and balancing'],
    regions: ['Ambalangoda', 'Bentota', 'Matara'],
    materials: 'Light wood, cloth, natural paints, strings, decorative materials',
  },
  'Drum Craft': {
    image: '/images/drum.jpg',
    description: 'Traditional percussion instrument making, particularly the iconic Gatabera (drum), essential to Sri Lankan ceremonial music and dance.',
    history: 'Drum making has been refined over centuries, with specific families holding hereditary rights as royal drummers. Different drum types serve distinct ceremonial and musical purposes.',
    techniques: ['Wood selection and hollowing', 'Hide preparation and stretching', 'Tuning system installation', 'Decorative carving', 'Final assembly'],
    regions: ['Kandy', 'Matale', 'Kegalle'],
    materials: 'Jak or mango wood, animal hide (goat or cattle), leather lacing, natural resins',
  },
  'Rabana Making': {
    image: '/images/rabana.jpg',
    description: 'Crafting of traditional hand drums played during festive occasions, particularly Sinhala New Year celebrations, creating rhythmic communal music.',
    history: 'Rabana represents community spirit in Sri Lankan culture. Women traditionally gather to play rabana, creating complex rhythmic patterns that accompany folk songs.',
    techniques: ['Frame construction', 'Hide selection and treatment', 'Stretching and securing', 'Decoration', 'Tuning'],
    regions: ['Kandy', 'Colombo', 'Gampaha'],
    materials: 'Wooden circular frame, goat hide, leather strips, decorative paint',
  },
  'Beeralu Lace': {
    image: '/images/belalu.jpg',
    description: 'Delicate lace-making using traditional bobbin techniques, creating intricate patterns for clothing embellishments, decorative items, and ceremonial textiles.',
    history: "Introduced by Portuguese colonizers in the 16th century, Beeralu (bobbin lace) was adopted and refined by Sri Lankan artisans, particularly in southern coastal regions. Women's cooperatives have preserved this intricate craft.",
    techniques: ['Thread preparation and winding', 'Bobbin arrangement', 'Pattern pinning', 'Twisting and crossing threads', 'Edge finishing'],
    regions: ['Galle', 'Matara', 'Ambalangoda'],
    materials: 'Fine cotton or silk thread, wooden bobbins, lace pillows, pattern cards, pins',
  },
  'Sesath Craft': {
    image: '/images/sesth.png',
    description: 'Traditional craft using sesath (a type of natural fiber), creating woven mats, baskets, and decorative items with distinctive regional patterns.',
    history: 'Sesath weaving has been practiced in rural communities for generations, with each village developing unique patterns. This sustainable craft utilizes locally harvested materials.',
    techniques: ['Fiber harvesting and drying', 'Splitting and sorting', 'Dyeing preparation', 'Weaving techniques', 'Pattern integration'],
    regions: ['Kurunegala', 'Anuradhapura', 'Puttalam'],
    materials: 'Sesath fibers, natural dyes, simple weaving tools',
  },
  'Palm Leaf Craft': {
    image: '/images/palm.jpg',
    description: 'Artworks and functional items created from palmyra and coconut palm leaves, including woven products, decorative pieces, and traditional roofing materials.',
    history: 'Palm leaf craft has ancient roots in Sri Lankan culture, with techniques used for everything from traditional manuscripts to household items. Each region developed specialized uses for palm materials.',
    techniques: ['Leaf selection and preparation', 'Weaving and plaiting', 'Natural dyeing', 'Structural assembly', 'Preservation treatment'],
    regions: ['Jaffna', 'Mannar', 'Puttalam'],
    materials: 'Palmyra leaves, coconut fronds, natural dyes, binding materials',
  },
  'Ola Leaf Manuscripts': {
    image: '/images/ola.jpg',
    description: "Sacred Buddhist texts and historical documents inscribed on dried palm leaves (ola), representing one of Sri Lanka's most important cultural preservation traditions.",
    history: 'Ola leaf manuscript writing dates back over 2,000 years in Sri Lanka. Monks and scribes used iron styluses to inscribe Pali texts, creating libraries of knowledge that survived for centuries.',
    techniques: ['Leaf preparation and curing', 'Stylus inscription', 'Soot application', 'Cleaning and polishing', 'Binding between wooden covers'],
    regions: ['Kandy', 'Anuradhapura', 'Galle'],
    materials: 'Talipot palm leaves, iron styluses, soot, coconut oil, sandalwood covers',
  },
  'Calabash Art': {
    image: '/images/Calabash.jpg',
    description: 'Decorative craft using dried calabash gourds, carved and painted to create containers, musical instruments, and ornamental pieces.',
    history: 'Calabash crafting has utilitarian and artistic roots in rural Sri Lanka. Farmers and artisans transformed these natural vessels into functional and decorative objects.',
    techniques: ['Gourd harvesting and drying', 'Carving and etching', 'Pyrography (burn designs)', 'Painting and decoration', 'Sealing and finishing'],
    regions: ['Kurunegala', 'Anuradhapura', 'Hambantota'],
    materials: 'Calabash gourds, carving tools, natural paints, pyrography equipment, varnishes',
  },
  'Traditional Toy Making': {
    image: '/images/toy.jpg',
    description: 'Handcrafted wooden toys, clay figures, and woven playthings that reflect Sri Lankan cultural themes and traditional design motifs.',
    history: 'Traditional toy making preserved cultural stories and taught children about their heritage. Artisans created toys from local materials, often depicting animals, folk characters, and daily life scenes.',
    techniques: ['Wood carving and shaping', 'Clay modeling', 'Natural painting', 'Jointed articulation', 'Finishing touches'],
    regions: ['Matale', 'Kandy', 'Gampaha'],
    materials: 'Soft woods, clay, natural paints, simple tools, vegetable dyes',
  },
  'Horn Craft': {
    image: '/images/horn.jpg',
    description: 'Skilled artistry working with animal horn to create combs, decorative items, jewelry, and functional objects with polished, translucent beauty.',
    history: 'Horn craft developed as artisans discovered methods to heat, shape, and polish buffalo and cattle horn. This craft produced both utilitarian items and luxury goods.',
    techniques: ['Horn selection and cleaning', 'Heat softening', 'Shaping and molding', 'Carving details', 'Polishing to transparency'],
    regions: ['Colombo', 'Kandy', 'Galle'],
    materials: 'Buffalo horn, cattle horn, heating equipment, carving tools, polishing compounds',
  },
};

// Accent colors per category index for the new card style
const ACCENT_COLORS = [
  '#A67C52', '#7B6E5D', '#8B7355', '#9B8B7A', '#A0856C',
  '#8C7B6B', '#B08860', '#957A65', '#7E6E5C', '#A47860',
  '#8A7260', '#9C8B78', '#A68070', '#876858', '#9A8470',
  '#B09070', '#8B7A68', '#A07862', '#957065', '#8C8070',
  '#A07858', '#906858', '#987068', '#8A8070', '#A08068',
  '#985F50',
];

const CategoryCard = ({ category, image, count, onClick, index }) => {
  const [imageError, setImageError] = useState(false);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
      style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${index * 30}ms` }}
    >
      {/* Image area */}
      <div className="relative overflow-hidden rounded-2xl mb-3" style={{ aspectRatio: '4/3' }}>
        {!imageError ? (
          <img
            src={image}
            alt={category}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${accent}22, ${accent}44)` }}
          >
            <Palette size={32} style={{ color: accent, opacity: 0.5 }} />
          </div>
        )}

        {/* Arrow on hover */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          style={{ background: accent }}
        >
          <ArrowUpRight size={15} className="text-white" />
        </div>
      </div>

      {/* Text */}
      <div>
        <h3
          className="text-sm font-bold text-deep-brown leading-snug mb-0.5 group-hover:text-cinnamon transition-colors duration-200"
          style={{ fontFamily: 'Cinzel Decorative, serif' }}
        >
          {category}
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px rounded" style={{ background: accent }} />
          <p className="text-xs text-soft-charcoal/60" style={{ fontFamily: 'Libre Baskerville, serif' }}>
            Traditional Craft
          </p>
        </div>
      </div>
    </div>
  );
};

const CategoryDetailModal = ({ category, details, count, onClose, onViewGallery }) => {
  if (!details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{ animation: 'slideUp 0.3s ease' }}
      >
        {/* Header image */}
        <div className="relative h-56 sm:h-72 overflow-hidden rounded-t-3xl sm:rounded-t-3xl flex-shrink-0">
          <img
            src={details.image}
            alt={category}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #E8D5C4, #D4AF37)';
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md"
          >
            <X size={16} className="text-deep-brown" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pb-8 -mt-2">
          {/* Title row */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-deep-brown pt-10" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                {category}
              </h2>
              <span className="flex-shrink-0 text-sm text-soft-charcoal/60 pt-1" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                {count} {count === 1 ? 'artwork' : 'artworks'}
              </span>
            </div>
            <div className="w-12 h-0.5 bg-cinnamon mt-3 rounded" />
          </div>

          {/* About */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-soft-charcoal/50 mb-2 flex items-center gap-2" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              <Palette size={13} className="text-cinnamon" /> About
            </h3>
            <p className="text-soft-charcoal leading-relaxed text-sm" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              {details.description}
            </p>
          </div>

          {/* history */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-soft-charcoal/50 mb-2 flex items-center gap-2" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              <History size={13} className="text-cinnamon" /> Historical Background
            </h3>
            <p className="text-soft-charcoal leading-relaxed text-sm" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              {details.history}
            </p>
          </div>

          {/* techniques */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-soft-charcoal/50 mb-3 flex items-center gap-2" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              <Layers size={13} className="text-cinnamon" /> Techniques
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {details.techniques.map((technique, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-warm-sand/40 border border-cinnamon/10">
                  <span className="text-xs font-bold text-cinnamon w-5 flex-shrink-0" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-soft-charcoal text-xs" style={{ fontFamily: 'Libre Baskerville, serif' }}>{technique}</p>
                </div>
              ))}
            </div>
          </div>

          {/* regions + materials row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-soft-charcoal/50 mb-2 flex items-center gap-2" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                <MapPin size={13} className="text-cinnamon" /> Regions
              </h3>
              <div className="flex flex-wrap gap-2">
                {details.regions.map((region, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full text-xs font-semibold bg-cinnamon/8 text-cinnamon border border-cinnamon/20"
                    style={{ fontFamily: 'Libre Baskerville, serif', background: 'rgba(166,124,82,0.08)' }}>
                    {region}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-soft-charcoal/50 mb-2 flex items-center gap-2" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                <Package size={13} className="text-cinnamon" /> Materials
              </h3>
              <p className="text-soft-charcoal text-xs leading-relaxed" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                {details.materials}
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onViewGallery}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-300 hover:opacity-90 active:scale-98"
            style={{
              background: 'linear-gradient(135deg, #A67C52, #8b5e38)',
              fontFamily: 'Libre Baskerville, serif',
            }}
          >
            <Palette size={16} />
            <span>Explore {category} Gallery</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
};

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategoryStats();
    const categoryParam = searchParams.get('category');
    if (categoryParam && CATEGORY_DETAILS[categoryParam]) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const fetchCategoryStats = async () => {
    try {
      const res = await artworkAPI.getStatsByCategory();
      setCategoryStats(res.data.data || []);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryCount = (name) => {
    const stat = categoryStats.find((s) => s._id === name);
    return stat ? stat.count : 0;
  };

  // Exclude 'Other'
  const categories = Object.keys(CATEGORY_DETAILS)
    .filter(name => name !== 'Other')
    .map(name => ({
      name,
      image: CATEGORY_DETAILS[name].image,
      count: getCategoryCount(name),
    }));

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewGallery = () => {
    navigate(`/gallery?category=${encodeURIComponent(selectedCategory)}`);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    navigate('/categories', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF6F1' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-cinnamon border-t-transparent mx-auto mb-3" />
          <p className="text-cinnamon text-sm" style={{ fontFamily: 'Libre Baskerville, serif' }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAF6F1' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Hero Section — wave style */}
      <section className="relative overflow-hidden" style={{ background: '#EDE0D0', minHeight: '440px' }}>

        {/* Background image*/}
        <img
          src="/images/heritage2.png"
          alt="Sri Lankan Folk Art"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45, mixBlendMode: 'multiply' }}
        />

        {/* Central radial glow the "clay orb" effect from courses page */}
        <div
          className="absolute"
          style={{
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            paddingBottom: '75%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(237,228,215,0.95) 0%, rgba(237,228,215,0.65) 40%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Centered content */}
        <div className="relative flex flex-col items-center justify-center text-center pt-30 px-8 space-y-8 pb-8">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-none mb-4"
            style={{
              fontFamily: 'Cinzel Decorative, serif',
              color: '#5C2E0E',
            }}
          >
            FOLK ART CATEGORIES
          </h1>

          <p
            className="text-base sm:text-lg max-w-lg mb-8 leading-relaxed"
            style={{ fontFamily: 'Libre Baskerville, serif', color: 'black' }}
          >
            Discover Sri Lanka's living heritage — centuries of craft traditions passed down through generations of skilled artisans.
          </p>

          {/* White pill search — exactly like courses page */}
          <div
            className="flex items-center w-full max-w-lg rounded-2xl shadow-md overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.90)',
              border: '1.5px solid rgba(166,124,82,0.18)',
            }}
          >
            <div className="pl-5 pr-3 flex-shrink-0">
              <Search size={16} style={{ color: '#A67C52' }} />
            </div>
            <input
              type="text"
              placeholder="Search categories…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 py-4 text-sm outline-none bg-transparent"
              style={{ fontFamily: 'Libre Baskerville, serif', color: '#3D2B1F' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="pr-4">
                <X size={14} style={{ color: '#A67C52' }} />
              </button>
            )}
          </div>

          <p
            className="text-xs mt-3 opacity-55"
            style={{ fontFamily: 'Libre Baskerville, serif', color: '#5C3D2E' }}
          >
            {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
          </p>
        </div>

        {/* Wave SVG — smooth cutout into page bg */}
        <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
          <svg
            viewBox="0 0 1440 80"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: '80px' }}
          >
            <path
              d="M0,48 C180,80 360,16 540,44 C720,72 900,16 1080,44 C1260,72 1380,32 1440,48 L1440,80 L0,80 Z"
              fill="#FAF6F1"
            />
          </svg>
        </div>
      </section>


      {/* Intro / Description Section */}
      {!searchTerm && (
        <section className="pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="rounded-3xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Left: text */}
              <div className="flex-1 p-8 sm:p-10 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-px rounded" style={{ background: '#D4AF37' }} />
                  <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ fontFamily: 'Libre Baskerville, serif', color: '#D4AF37' }}
                  >
                    Living Heritage
                  </span>
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-bold mb-4 leading-tight"
                  style={{ fontFamily: 'Cinzel Decorative, serif', color: 'black' }}
                >
                  The Soul of Sri Lanka's <span style={{ color: '#D4AF37' }}>Folk Arts</span>
                </h2>

                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ fontFamily: 'Libre Baskerville, serif', color: 'deep-brown', maxWidth: '480px' }}
                >
                  For over two millennia, Sri Lankan artisans have transformed the island's natural abundance — its forests, clay, metals, and fibers — into objects of breathtaking beauty and spiritual meaning. These folk arts are not museum relics; they are living practices, still taught hand-to-hand across generations in villages from the misty highlands of Kandy to the sun-washed shores of the south.
                </p>

                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: 'Libre Baskerville, serif', color: 'deep-brown', maxWidth: '480px' }}
                >
                  Each craft carries within it a distinct philosophy — the patience of the lace-maker, the rhythm of the weaver, the devotion of the mask-carver. Together, they form a tapestry that is uniquely, unmistakably Sri Lankan.
                </p>

                <div className="flex items-center gap-6 mt-8">
                  {[
                    { num: '2500+', label: 'Years of Tradition' },
                    { num: '26', label: 'Craft Categories' },
                    { num: '9', label: 'Provinces' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div
                        className="text-xl font-bold"
                        style={{ fontFamily: 'Cinzel Decorative, serif', color: '#D4AF37' }}
                      >
                        {stat.num}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ fontFamily: 'Libre Baskerville, serif', color: 'black' }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* decorative image mosaic */}
              <div className="hidden md:flex w-72 lg:w-80 flex-shrink-0 p-4 gap-2">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex-1 rounded-2xl overflow-hidden">
                    <img src="/images/pot.jpg" alt="" className="w-full h-full object-cover opacity-80" onError={e => e.target.parentElement.style.background='#5C3D2E'} />
                  </div>
                  <div className="h-28 rounded-2xl overflow-hidden">
                    <img src="/images/metalcraft.jpg" alt="" className="w-full h-full object-cover opacity-80" onError={e => e.target.parentElement.style.background='#7A4F35'} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-28">
                  <div className="h-28 rounded-2xl overflow-hidden">
                    <img src="/images/sesth.png" alt="" className="w-full h-full object-cover opacity-80" onError={e => e.target.parentElement.style.background='#4A3020'} />
                  </div>
                  <div className="flex-1 rounded-2xl overflow-hidden">
                    <img src="/images/ds5.jpg" alt="" className="w-full h-full object-cover opacity-80" onError={e => e.target.parentElement.style.background='#6B4530'} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-24">
              <Palette size={48} className="mx-auto text-soft-charcoal/20 mb-4" />
              <h3 className="text-lg font-bold text-deep-brown mb-1" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                No Categories Found
              </h3>
              <p className="text-soft-charcoal/50 text-sm" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
              {filteredCategories.map((cat, idx) => (
                <CategoryCard
                  key={idx}
                  index={idx}
                  category={cat.name}
                  image={cat.image}
                  count={cat.count}
                  onClick={() => setSelectedCategory(cat.name)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedCategory && (
        <CategoryDetailModal
          category={selectedCategory}
          details={CATEGORY_DETAILS[selectedCategory]}
          count={getCategoryCount(selectedCategory)}
          onClose={handleCloseModal}
          onViewGallery={handleViewGallery}
        />
      )}
    </div>
  );
};

export default Categories;