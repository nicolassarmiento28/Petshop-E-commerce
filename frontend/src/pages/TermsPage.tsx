import { Link } from 'react-router-dom'
import Layout from '@/components/layout/Layout'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
      {title}
    </h2>
    <div className="text-gray-600 leading-relaxed space-y-3 text-sm">{children}</div>
  </div>
)

export default function TermsPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-600">Términos y Condiciones</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Términos y Condiciones
        </h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: enero 2025</p>

        <Section title="1. Aceptación de los términos">
          <p>Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.</p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p>Petshop Chile es una tienda en línea dedicada a la venta de productos para mascotas, incluyendo alimentos, accesorios, juguetes e insumos veterinarios. Nos reservamos el derecho de modificar o interrumpir el servicio en cualquier momento sin previo aviso.</p>
        </Section>

        <Section title="3. Proceso de compra">
          <p>Al realizar un pedido en nuestra tienda, usted:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Confirma que la información proporcionada es veraz y exacta</li>
            <li>Acepta pagar el precio indicado más los costos de envío aplicables</li>
            <li>Entiende que la disponibilidad de productos está sujeta a stock existente</li>
            <li>Reconoce que los precios pueden cambiar sin previo aviso</li>
          </ul>
        </Section>

        <Section title="4. Precios y pagos">
          <p>Todos los precios están expresados en pesos chilenos (CLP) e incluyen IVA. El pago se realiza exclusivamente a través de Transbank Webpay Plus, garantizando la seguridad de la transacción. No almacenamos datos de tarjetas de crédito o débito.</p>
        </Section>

        <Section title="5. Despacho y entrega">
          <p>Los plazos de entrega son estimados y pueden variar según la región. Petshop Chile no se hace responsable por retrasos ocasionados por factores externos como condiciones climáticas, huelgas o fuerza mayor. El riesgo de pérdida o daño de los productos pasa al comprador en el momento de la entrega.</p>
        </Section>

        <Section title="6. Propiedad intelectual">
          <p>Todo el contenido de este sitio, incluyendo textos, imágenes, logotipos y diseños, es propiedad de Petshop Chile y está protegido por las leyes de propiedad intelectual vigentes en Chile. Queda prohibida su reproducción o uso sin autorización expresa.</p>
        </Section>

        <Section title="7. Limitación de responsabilidad">
          <p>Petshop Chile no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar nuestros productos o servicios. Nuestra responsabilidad máxima se limita al valor del pedido realizado.</p>
        </Section>

        <Section title="8. Ley aplicable">
          <p>Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa será sometida a la jurisdicción de los tribunales ordinarios de justicia de Santiago de Chile.</p>
        </Section>

        <Section title="9. Contacto">
          <p>Para consultas relacionadas con estos términos y condiciones, contáctenos en:</p>
          <p className="font-medium text-gray-700">Petshop Chile · Av. Ejemplo 1234, Santiago · contacto@petshop.cl</p>
        </Section>
      </div>
    </Layout>
  )
}
