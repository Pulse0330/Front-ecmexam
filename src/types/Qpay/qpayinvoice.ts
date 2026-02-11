// src/types/Qpay/qpayinvoice.ts

export interface QPayBankUrl {
	name: string;
	description: string;
	logo: string;
	link: string;
}

export interface QPayInvoiceResponse {
	invoice_id: string;
	qr_text: string;
	qr_image: string;
	qPay_shortUrl: string;
	urls: QPayBankUrl[];
}
