import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { OrderRepository } from '../models/repositories/order.repository';
import { OrderEntity } from '../models/entities/order.entity';
import { OrderStatusEnum } from '../enums/order.enum';
import { GetAllOrderDto } from '../dtos/get-all-order.dto';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { applySortingToFindOptions } from 'src/common/factory/sort';
import { TIMER_CONSTANT } from 'src/common/constants/timer';
import { SymbolsEnum } from '../enums/symbols.enum';

@Injectable()
export class OrderService {
  private btcPrice: number;
  private ethPrice: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly orderRepository: OrderRepository,
  ) {
    this.updatePrices();
    this.startOrderCreation();
    this.startOrderProcessing();
  }

  private async updatePrices() {
    this.btcPrice = await this.redisService.getPrice(SymbolsEnum.BTC_USDT);
    this.ethPrice = await this.redisService.getPrice(SymbolsEnum.ETH_USDT);
    setTimeout(() => this.updatePrices(), TIMER_CONSTANT as number);
  }

  async createOrder() {
    for (let i = 0; i < 100; i++) {
      const btcAmount = this.getRandomAmount();
      const ethAmount = this.getRandomAmount();
      const btcOrder = this.createOrderEntity(
        SymbolsEnum.BTC_USDT,
        this.btcPrice,
        btcAmount,
      );
      const ethOrder = this.createOrderEntity(
        SymbolsEnum.ETH_USDT,
        this.ethPrice,
        ethAmount,
      );
      console.log('BTC Order:', btcOrder);
      await this.orderRepository.save(btcOrder);
      await this.orderRepository.save(ethOrder);
    }
  }

  private getRandomAmount(): number {
    return parseFloat((Math.random() * (0.1 - 0.001) + 0.001).toFixed(3));
  }

  private createOrderEntity(
    symbol: string,
    price: number,
    amount: number,
  ): OrderEntity {
    const order = new OrderEntity();
    order.symbol = symbol;
    order.price = price;
    order.amount = amount;
    order.total = price * amount;
    order.status = OrderStatusEnum.OPEN;
    return order;
  }

  private async startOrderCreation() {
    setInterval(() => this.createOrder(), TIMER_CONSTANT as number);
  }

  private async startOrderProcessing() {
    setInterval(async () => {
      const orders = await this.orderRepository.find({
        where: { status: OrderStatusEnum.OPEN },
      });

      for (const order of orders) {
        const currentPrice = await this.redisService.getPrice(order.symbol);

        if (currentPrice > order.price * 0.03 + order.price) {
          order.status = OrderStatusEnum.LIQUID;
          order.liquidPrice = currentPrice;
          await this.orderRepository.save(order);
        }
      }
    }, TIMER_CONSTANT as number);
  }

  async getOrderById(id: number) {
    return this.orderRepository.findById(id);
  }

  async getAllOrders(query: GetAllOrderDto): Promise<[OrderEntity[], number]> {
    const { page, limit, status, symbol, sort, sortOrder } = query;

    const where: FindOptionsWhere<OrderEntity> = {};
    if (status) {
      where.status = status;
    }
    if (symbol) {
      where.symbol = symbol;
    }

    let findOptions: FindManyOptions<OrderEntity> = {
      where,
      take: limit,
      skip: (page - 1) * limit,
    };

    findOptions = applySortingToFindOptions(findOptions, sort, sortOrder);

    const [result, total] =
      await this.orderRepository.findAndCount(findOptions);

    return [result, total];
  }
}
