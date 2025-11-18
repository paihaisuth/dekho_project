interface Ireservation {
  id: string;
  idCard: string;
  firstname: string;
  lastname: string;
  status: boolean;
  paidDate: string;
  reservePriceDate: string;
  reservePrice: number;
  securityPriceDate: string;
  securityPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  roomID: string;
}

export default Ireservation;
