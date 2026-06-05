import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#2b44d4] dark:bg-[#1e33a8] text-gray-300 dark:text-[#8892a4] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐾</span>
              <span
                className="text-xl font-bold text-white dark:text-[#e8eaf0]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Petshop
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Tu tienda de confianza para el cuidado y bienestar de tus mascotas. Productos de calidad, atención personalizada.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 dark:bg-[#222222] hover:bg-blue-600 hover:text-white text-gray-400 dark:text-[#8892a4] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 dark:bg-[#222222] hover:bg-blue-600 hover:text-white text-gray-400 dark:text-[#8892a4] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              {/* TikTok icon — lucide doesn't have it, use SVG */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 dark:bg-[#222222] hover:bg-blue-600 hover:text-white text-gray-400 dark:text-[#8892a4] transition-colors"
                aria-label="TikTok"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.94a8.16 8.16 0 004.78 1.52V7a4.85 4.85 0 01-1.01-.31z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white dark:text-[#e8eaf0] font-semibold text-sm uppercase tracking-wider mb-4">Categorías</h4>
            <ul className="space-y-2">
              {[
                'Perro', 'Gato', 'Farmacia',
                { label: 'Peluquería', to: '/categoria/pequenas-mascotas' },
                'Ofertas', 'Marcas',
              ].map((cat) => {
                const label = typeof cat === 'string' ? cat : cat.label
                const to = typeof cat === 'string'
                  ? `/categoria/${cat.toLowerCase().replace(/ /g, '-').replace('ñ', 'n')}`
                  : cat.to
                return (
                  <li key={label}>
                    <Link to={to} className="text-sm text-gray-400 hover:text-blue-500 transition-colors">
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white dark:text-[#e8eaf0] font-semibold text-sm uppercase tracking-wider mb-4">Información</h4>
            <ul className="space-y-2">
              {[
                { label: 'Política de privacidad', href: '/privacidad' },
                { label: 'Términos y condiciones', href: '/terminos' },
                { label: 'Cambios y devoluciones', href: '/devoluciones' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-blue-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Map */}
          <div>
            <h4 className="text-white dark:text-[#e8eaf0] font-semibold text-sm uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-3 mb-5">
              <li>
                <a
                  href="https://maps.app.goo.gl/8wmBjrmk5d53DyXk9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <MapPin size={15} className="shrink-0 mt-0.5" />
                  <span>Av. Libertad 535, Viña del Mar, Chile</span>
                </a>
              </li>
              <li>
                <a href="tel:+56912345678" className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-500 transition-colors">
                  <Phone size={15} className="shrink-0" />
                  +56 9 1234 5678
                </a>
              </li>
              <li>
                <a href="mailto:contacto@petshop.cl" className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-500 transition-colors">
                  <Mail size={15} className="shrink-0" />
                  contacto@petshop.cl
                </a>
              </li>
            </ul>
            <div className="overflow-hidden rounded-xl">
              <iframe
                src="https://www.google.com/maps?q=Av.+Libertad+535+Vi%C3%B1a+del+Mar+Chile&output=embed"
                width="100%"
                height="160"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Petshop Viña del Mar"
                className="bg-gray-800 dark:bg-[#222222]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-[#2a2a2a] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Petshop. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
