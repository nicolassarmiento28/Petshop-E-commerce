import {
  WebpayPlus,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  Environment,
} from 'transbank-sdk'

function getTransaction(): InstanceType<typeof WebpayPlus.Transaction> {
  if (process.env.NODE_ENV === 'production') {
    return new WebpayPlus.Transaction(
      new Options(
        process.env.TBK_COMMERCE_CODE!,
        process.env.TBK_API_KEY!,
        Environment.Production,
      ),
    )
  }
  return new WebpayPlus.Transaction(
    new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration,
    ),
  )
}

export async function createTransaction(
  buyOrder: string,
  sessionId: string,
  amount: number,
  returnUrl: string,
): Promise<{ token: string; url: string }> {
  const tx = getTransaction()
  return tx.create(buyOrder, sessionId, amount, returnUrl)
}

export async function commitTransaction(token: string): Promise<{
  status: string
  response_code: number
  authorization_code: string
  card_detail: { card_number: string }
  amount: number
  buy_order: string
}> {
  const tx = getTransaction()
  return tx.commit(token)
}
