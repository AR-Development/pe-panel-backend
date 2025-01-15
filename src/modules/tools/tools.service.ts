import { Injectable } from "@nestjs/common";
import * as marketJson from "../../../config/marketDataJson.json";

@Injectable()
export class ToolsService {
  compensateCalculator(itemDropString: string) {
    const items = itemDropString.split(",");
    const marketPrices = marketJson;
    let maxPrice = 0;
    let minPrice = 0;
    const errorItems = [];
    items.forEach((i) => {
      try {
        const splitted = i.split("*");
        const marketItem = splitted[0];
        const amount = splitted[1];
        maxPrice += marketPrices[marketItem]["maxPrice"] * parseInt(amount);
        minPrice += marketPrices[marketItem]["minPrice"] * parseInt(amount);
      } catch (error) {
        errorItems.push(i);
      }
    });
    const response = {
      maxPrice: maxPrice,
      minPrice: minPrice,
      ...(errorItems.length > 0 && { error: errorItems }),
    };
    return response;
  }
}
