import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Layout from '@/components/layout/Layout'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
      {title}
    </h2>
    <div className="text-gray-600 leading-relaxed space-y-3 text-sm">{children}</div>
  </div>
)

export default function AboutPage() {
  return (
    <Layout>
      <Helmet>
        <title>Nosotros | Petshop</title>
        <meta name="description" content="Conoce Petshop, tu tienda de mascotas en Viña del Mar. Alimentos premium, accesorios y farmacia veterinaria." />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-600">Nosotros</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Nosotros
        </h1>
        <p className="text-sm text-gray-400 mb-10">Conoce más sobre Petshop</p>

        <Section title="Nuestra historia">
          <p>
            Petshop nació en Viña del Mar con la misión de ofrecer a las mascotas y sus dueños los mejores productos
            del mercado. Desde nuestros inicios, nos hemos dedicado a seleccionar cuidadosamente cada artículo
            que llega a nuestras manos, asegurándonos de que cumpla con los más altos estándares de calidad.
          </p>
          <p>
            Ubicados en la hermosa región de Valparaíso, atendemos a clientes de toda Chile con envíos rápidos
            y seguros. Creemos que las mascotas son parte de la familia, y merecen lo mejor.
          </p>
        </Section>

        <Section title="Nuestra misión">
          <p>
            Proporcionar productos de calidad superior para el bienestar de perros y gatos, ofreciendo una
            experiencia de compra fácil, segura y confiable. Trabajamos con las mejores marcas nacionales e
            internacionales para garantizar la nutrición, salud y felicidad de tu mascota.
          </p>
        </Section>

        <Section title="¿Por qué elegirnos?">
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Alimentos súper premium y premium de primeras marcas</li>
            <li>Atención personalizada y asesoría experta</li>
            <li>Envíos a todo Chile con despacho rápido</li>
            <li>Pago seguro vía Transbank Webpay Plus</li>
            <li>Política de cambios y devoluciones sin complicaciones</li>
          </ul>
        </Section>

        <Section title="Contacto">
          <p>Ubicación: Viña del Mar, Región de Valparaíso, Chile</p>
          <p>Email: contacto@petshop.cl</p>
          <p>Teléfono: +56 2 2123 4567</p>
        </Section>
      </div>
    </Layout>
  )
}
