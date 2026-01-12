/**
 * Nifty 50 and Nifty Next 50 configuration
 */

export interface NiftyStockConfig {
	symbol: string;
	name: string;
}

/**
 * Nifty 50 stocks
 * Source: NSE India
 */
export const NIFTY_50: NiftyStockConfig[] = [
	{ symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
	{ symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
	{ symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
	{ symbol: 'INFY.NS', name: 'Infosys' },
	{ symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
	{ symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
	{ symbol: 'ITC.NS', name: 'ITC' },
	{ symbol: 'SBIN.NS', name: 'State Bank of India' },
	{ symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
	{ symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
	{ symbol: 'LT.NS', name: 'Larsen & Toubro' },
	{ symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
	{ symbol: 'AXISBANK.NS', name: 'Axis Bank' },
	{ symbol: 'ASIANPAINT.NS', name: 'Asian Paints' },
	{ symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
	{ symbol: 'HCLTECH.NS', name: 'HCL Technologies' },
	{ symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical' },
	{ symbol: 'TITAN.NS', name: 'Titan Company' },
	{ symbol: 'WIPRO.NS', name: 'Wipro' },
	{ symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement' },
	{ symbol: 'NESTLEIND.NS', name: 'Nestle India' },
	{ symbol: 'ONGC.NS', name: 'ONGC' },
	{ symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
	{ symbol: 'NTPC.NS', name: 'NTPC' },
	{ symbol: 'POWERGRID.NS', name: 'Power Grid' },
	{ symbol: 'M&M.NS', name: 'Mahindra & Mahindra' },
	{ symbol: 'TECHM.NS', name: 'Tech Mahindra' },
	{ symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv' },
	{ symbol: 'ADANIENT.NS', name: 'Adani Enterprises' },
	{ symbol: 'JSWSTEEL.NS', name: 'JSW Steel' },
	{ symbol: 'COALINDIA.NS', name: 'Coal India' },
	{ symbol: 'TATASTEEL.NS', name: 'Tata Steel' },
	{ symbol: 'DRREDDY.NS', name: 'Dr. Reddy\'s Labs' },
	{ symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank' },
	{ symbol: 'CIPLA.NS', name: 'Cipla' },
	{ symbol: 'EICHERMOT.NS', name: 'Eicher Motors' },
	{ symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals' },
	{ symbol: 'BPCL.NS', name: 'BPCL' },
	{ symbol: 'ADANIPORTS.NS', name: 'Adani Ports' },
	{ symbol: 'DIVISLAB.NS', name: 'Divi\'s Laboratories' },
	{ symbol: 'BRITANNIA.NS', name: 'Britannia' },
	{ symbol: 'HINDALCO.NS', name: 'Hindalco Industries' },
	{ symbol: 'GRASIM.NS', name: 'Grasim Industries' },
	{ symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp' },
	{ symbol: 'TRENT.NS', name: 'Trent' },
	{ symbol: 'SBILIFE.NS', name: 'SBI Life Insurance' },
	{ symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance' },
	{ symbol: 'SHRIRAMFIN.NS', name: 'Shriram Finance' },
	{ symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto' },
	{ symbol: 'LTIM.NS', name: 'LTIMindtree' }
];

/**
 * Nifty Next 50 stocks
 * Source: NSE India
 */
export const NIFTY_NEXT_50: NiftyStockConfig[] = [
	{ symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy' },
	{ symbol: 'SIEMENS.NS', name: 'Siemens' },
	{ symbol: 'DLF.NS', name: 'DLF' },
	{ symbol: 'GODREJCP.NS', name: 'Godrej Consumer' },
	{ symbol: 'GAIL.NS', name: 'GAIL India' },
	{ symbol: 'BOSCHLTD.NS', name: 'Bosch' },
	{ symbol: 'VEDL.NS', name: 'Vedanta' },
	{ symbol: 'ABB.NS', name: 'ABB India' },
	{ symbol: 'AMBUJACEM.NS', name: 'Ambuja Cements' },
	{ symbol: 'PIDILITIND.NS', name: 'Pidilite Industries' },
	{ symbol: 'INDIGO.NS', name: 'IndiGo' },
	{ symbol: 'BANKBARODA.NS', name: 'Bank of Baroda' },
	{ symbol: 'DMART.NS', name: 'Avenue Supermarts' },
	{ symbol: 'COLPAL.NS', name: 'Colgate-Palmolive' },
	{ symbol: 'MOTHERSON.NS', name: 'Motherson Sumi' },
	{ symbol: 'MARICO.NS', name: 'Marico' },
	{ symbol: 'DABUR.NS', name: 'Dabur India' },
	{ symbol: 'TORNTPHARM.NS', name: 'Torrent Pharma' },
	{ symbol: 'HAL.NS', name: 'HAL' },
	{ symbol: 'IOC.NS', name: 'Indian Oil' },
	{ symbol: 'ZOMATO.NS', name: 'Zomato' },
	{ symbol: 'BAJAJHLDNG.NS', name: 'Bajaj Holdings' },
	{ symbol: 'PNB.NS', name: 'Punjab National Bank' },
	{ symbol: 'TATACONSUM.NS', name: 'Tata Consumer' },
	{ symbol: 'HAVELLS.NS', name: 'Havells India' },
	{ symbol: 'ICICIPRULI.NS', name: 'ICICI Prudential' },
	{ symbol: 'LUPIN.NS', name: 'Lupin' },
	{ symbol: 'BEL.NS', name: 'BEL' },
	{ symbol: 'MCDOWELL-N.NS', name: 'United Spirits' },
	{ symbol: 'LICHSGFIN.NS', name: 'LIC Housing Finance' },
	{ symbol: 'NAUKRI.NS', name: 'Info Edge' },
	{ symbol: 'TATAPOWER.NS', name: 'Tata Power' },
	{ symbol: 'MUTHOOTFIN.NS', name: 'Muthoot Finance' },
	{ symbol: 'ADANITRANS.NS', name: 'Adani Transmission' },
	{ symbol: 'CHOLAFIN.NS', name: 'Cholamandalam' },
	{ symbol: 'BERGEPAINT.NS', name: 'Berger Paints' },
	{ symbol: 'JINDALSTEL.NS', name: 'Jindal Steel' },
	{ symbol: 'GODREJPROP.NS', name: 'Godrej Properties' },
	{ symbol: 'CANBK.NS', name: 'Canara Bank' },
	{ symbol: 'UPL.NS', name: 'UPL' },
	{ symbol: 'INDUSTOWER.NS', name: 'Indus Towers' },
	{ symbol: 'ATGL.NS', name: 'Adani Total Gas' },
	{ symbol: 'PAGEIND.NS', name: 'Page Industries' },
	{ symbol: 'HINDZINC.NS', name: 'Hindustan Zinc' },
	{ symbol: 'NMDC.NS', name: 'NMDC' },
	{ symbol: 'ALKEM.NS', name: 'Alkem Laboratories' },
	{ symbol: 'AUBANK.NS', name: 'AU Small Finance Bank' },
	{ symbol: 'BIOCON.NS', name: 'Biocon' },
	{ symbol: 'TATACOMM.NS', name: 'Tata Communications' },
	{ symbol: 'MPHASIS.NS', name: 'Mphasis' }
];
