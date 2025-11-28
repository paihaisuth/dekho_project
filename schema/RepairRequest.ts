interface IrepairRequest {
  id: string;
  details: string;
  fixDate: string;
  userID: string;
  roomID: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export default IrepairRequest;
