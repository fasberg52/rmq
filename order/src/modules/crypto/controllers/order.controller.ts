import { OrderService } from './../services/order.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllOrderDto } from '../dtos/get-all-order.dto';
import { OrderListResponse, OrderResponse } from '../responses/order.response';
import { MessagePattern } from '@nestjs/microservices';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('get_all_orders')
  async getAllOrders(query: any): Promise<OrderListResponse> {
    console.log('Received message from Gateway:', query);

    const [result, total] = await this.orderService.getAllOrders(query);
    console.log('Response from order service >>>:', result);
    return new OrderListResponse(result, total);
  }

  @MessagePattern('get_order_by_id')
  async getOrderById(id: number): Promise<OrderResponse> {
    const result = await this.orderService.getOrderById(id);
    return new OrderResponse(result);
  }
}
