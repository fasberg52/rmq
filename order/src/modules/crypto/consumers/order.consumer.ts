import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { OrderEntity } from '../models/entities/order.entity';
import { OrderRepository } from '../models/repositories/order.repository';

@Injectable()
export class OrderConsumerService implements OnModuleInit {
  constructor(private readonly orderRepository: OrderRepository) {}

  @MessagePattern('order_created')
  async handleOrderCreated(orderData: Partial<OrderEntity>) {
    const order = new OrderEntity();
    Object.assign(order, orderData);
    order.total = order.price * order.amount;
    console.log('Order created:', order);
    await this.orderRepository.save(order);
  }

  async onModuleInit() {
    console.log('OrderConsumerService initialized.');
  }
}
