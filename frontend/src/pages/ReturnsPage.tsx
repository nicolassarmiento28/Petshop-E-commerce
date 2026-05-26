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

export default function ReturnsPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-600">Cambios y Devoluciones</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Cambios y Devoluciones
        </h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: enero 2025</p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-10">
          <p className="text-green-800 font-medium text-sm">
            En Petshop Chile queremos que usted y su mascota estén 100% satisfechos. Si algo no es lo que esperaba, estamos aquí para ayudarle.
          </p>
        </div>

        <Section title="1. Plazo para devoluciones">
          <p>Tiene hasta <strong>10 días corridos</strong> desde la recepción del producto para solicitar un cambio o devolución, de acuerdo con la Ley N° 19.496 de Protección al Consumidor de Chile.</p>
        </Section>

        <Section title="2. Condiciones del producto">
          <p>Para que una devolución sea aceptada, el producto debe cumplir las siguientes condiciones:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Estar en su embalaje original, sin abrir ni usar</li>
            <li>Incluir todos los accesorios y documentos originales</li>
            <li>No presentar daños causados por el comprador</li>
            <li>Tratarse de un producto con defecto de fábrica o error en el despacho</li>
          </ul>
          <p className="text-amber-600 font-medium">Nota: Los alimentos abiertos, antiparasitarios y medicamentos no son elegibles para devolución por razones de higiene y seguridad.</p>
        </Section>

        <Section title="3. Proceso de devolución">
          <p>Para iniciar una devolución, siga estos pasos:</p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>Envíe un correo a <a href="mailto:devoluciones@petshop.cl" className="text-blue-600 hover:underline">devoluciones@petshop.cl</a> con el número de orden y motivo de la devolución</li>
            <li>Adjunte fotografías del producto y su embalaje</li>
            <li>Nuestro equipo responderá en un plazo de 2 días hábiles</li>
            <li>De ser aprobada, recibirá instrucciones para el envío del producto</li>
          </ol>
        </Section>

        <Section title="4. Costos de envío en devoluciones">
          <p>Los costos de envío de devolución serán:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Sin costo para el cliente:</strong> cuando el producto tenga defecto de fábrica o sea un error nuestro en el despacho</li>
            <li><strong>A cargo del cliente:</strong> cuando la devolución sea por arrepentimiento o cambio de opinión</li>
          </ul>
        </Section>

        <Section title="5. Reembolsos">
          <p>Una vez recibido y aprobado el producto devuelto, procesaremos el reembolso en un plazo de <strong>5 a 10 días hábiles</strong>. El reembolso se realizará mediante el mismo medio de pago utilizado en la compra original.</p>
        </Section>

        <Section title="6. Productos dañados en el despacho">
          <p>Si su pedido llegó dañado durante el transporte, por favor fotografíe el embalaje y el producto al momento de recibirlo y contáctenos dentro de las <strong>24 horas</strong> siguientes a la entrega. Gestionaremos el reenvío o reembolso sin costo adicional.</p>
        </Section>

        <Section title="7. Contacto">
          <p>Para consultas sobre cambios y devoluciones:</p>
          <p className="font-medium text-gray-700">Email: devoluciones@petshop.cl</p>
          <p className="font-medium text-gray-700">Teléfono: +56 2 2123 4567 (Lun–Vie 9:00–18:00)</p>
        </Section>
      </div>
    </Layout>
  )
}
