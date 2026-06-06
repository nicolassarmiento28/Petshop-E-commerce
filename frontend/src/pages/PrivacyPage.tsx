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

export default function PrivacyPage() {
  return (
    <Layout>
      <Helmet>
        <title>Política de privacidad | Petshop</title>
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-600">Política de Privacidad</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Política de Privacidad
        </h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: enero 2025</p>

        <Section title="1. Información que recopilamos">
          <p>Recopilamos la información que usted nos proporciona directamente al realizar una compra, incluyendo:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono (opcional)</li>
            <li>Dirección de envío</li>
          </ul>
          <p>No almacenamos información de tarjetas de crédito. El procesamiento de pagos es realizado íntegramente por Transbank Webpay Plus.</p>
        </Section>

        <Section title="2. Uso de la información">
          <p>Utilizamos su información personal para:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Procesar y confirmar su pedido</li>
            <li>Enviarle actualizaciones sobre el estado de su compra</li>
            <li>Coordinar la entrega del producto</li>
            <li>Atender consultas y solicitudes de servicio al cliente</li>
          </ul>
          <p>No vendemos, intercambiamos ni transferimos su información personal a terceros sin su consentimiento, excepto a los socios de confianza que nos ayudan a operar el sitio web y gestionar el negocio.</p>
        </Section>

        <Section title="3. Cookies">
          <p>Utilizamos cookies para mejorar su experiencia en el sitio. Las cookies nos permiten recordar su carrito de compras y preferencias de navegación. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar el funcionamiento de algunas secciones del sitio.</p>
        </Section>

        <Section title="4. Seguridad">
          <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Toda la transmisión de datos sensibles se realiza mediante protocolos SSL/TLS.</p>
        </Section>

        <Section title="5. Sus derechos">
          <p>Usted tiene derecho a solicitar acceso, rectificación o eliminación de su información personal en cualquier momento. Para ejercer estos derechos, contáctenos a través de <a href="mailto:privacidad@petshop.cl" className="text-blue-600 hover:underline">privacidad@petshop.cl</a>.</p>
        </Section>

        <Section title="6. Contacto">
          <p>Si tiene preguntas sobre esta política de privacidad, puede contactarnos en:</p>
          <p className="font-medium text-gray-700">Petshop Chile · Av. Ejemplo 1234, Santiago · contacto@petshop.cl</p>
        </Section>
      </div>
    </Layout>
  )
}
