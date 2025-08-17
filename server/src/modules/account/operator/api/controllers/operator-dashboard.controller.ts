
import { OperatorValidation } from "../validation";
import { 
  AdminController
} from "@Package/api";

@AdminController({
  prefix: "operator",
})
export class OperatorDashboardController {
  constructor(
    private readonly operatorValidation: OperatorValidation,
  ) {}
}
