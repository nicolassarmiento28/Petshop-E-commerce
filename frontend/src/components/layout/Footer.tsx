import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, PawPrint } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#2b44d4] dark:bg-[#1e33a8] text-gray-300 dark:text-[#8892a4] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PawPrint size={28} className="text-orange-500 shrink-0" />
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
                className="p-2 rounded-lg bg-gray-800 dark:bg-dark-surface-elevated hover:bg-blue-600 hover:text-white text-gray-400 dark:text-[#8892a4] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 dark:bg-dark-surface-elevated hover:bg-blue-600 hover:text-white text-gray-400 dark:text-[#8892a4] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://wa.me/56912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 dark:bg-dark-surface-elevated hover:bg-green-500 hover:text-white text-gray-400 dark:text-[#8892a4] transition-colors"
                aria-label="WhatsApp"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
                { label: 'Peluquería', to: '/categoria/peluqueria' },
                'Ofertas', 'Marcas',
                { label: 'Veterinaria', to: '/veterinaria' },
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
                className="bg-gray-800 dark:bg-dark-surface-elevated"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-dark-border mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Petshop. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
