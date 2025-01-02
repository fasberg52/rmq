import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { catchError, lastValueFrom, Observable } from 'rxjs';
import { GetAllOrderDto } from './dto/get-all-order.dto';

@Controller('order')
@ApiTags('order')
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private orderClientService: ClientProxy,
  ) {}

  @Get('')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiOkResponse({ description: 'List of orders' })
  async getAllOrders(@Query() query: GetAllOrderDto) {
    try {
      const response = await lastValueFrom(
        this.orderClientService.send('get_all_orders', query).pipe(
          catchError((err) => {
            throw err;
          }),
        ),
      );
      return response;
    } catch (error) {
      console.error('rrror in Gateway:', error.message);

      throw new InternalServerErrorException('Internal server error');
    }
  }

  @ApiOperation({ summary: 'get order by id' })
  @ApiOkResponse()
  @Get(':id')
  async getOrderById(@Param('id') id: number) {
    const response = this.orderClientService.send('get_order_by_id', id);

    return response;
  }
}
