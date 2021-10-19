import { Response, Request } from "express";
import { FetchMessageService } from "../services/FetchMessageService";

class FetchMessageController {
  async handle(request: Request, response: Response) {
    const service = new FetchMessageService();
    const result = await service.execute();
    return response.json(result);
  }
}

export { FetchMessageController };
