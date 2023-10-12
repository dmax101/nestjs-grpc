import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Metadata } from '@grpc/grpc-js';
import { Observable, lastValueFrom } from 'rxjs';
import { resourceLimits } from 'worker_threads';

type Order = {
  order_id: string;
  account_id: string;
  asset_id: string;
  quantity_id: number;
  status_id: string;
};

interface OrderGrpcClient {
  createOrder(
    data: {
      account_id: string;
      asset_id: string;
      quantity: number;
    },
    metadata?: Metadata,
  ): Observable<{
    order: Order;
  }>;
  findAllOrders(
    data: {
      account_id: string;
    },
    metadata?: Metadata,
  ): Observable<{ orders: Order[] }>;
  findOneOrder(
    data: {
      order_id: string;
    },
    metadata?: Metadata,
  ): Observable<{ order: Order }>;
}

@Injectable()
export class OrdersService implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'fullcycle',
      protoPath: [join(__dirname, 'orders', 'proto', 'orders.proto')],
      loader: {
        keepCase: true,
      },
    },
  })
  clientGrpfc: ClientGrpc;

  private orderGrpcClient: OrderGrpcClient;

  onModuleInit() {
    this.orderGrpcClient = this.clientGrpfc.getService('OrderService');
  }

  async create(createOrderDto: CreateOrderDto) {
    const metadata = new Metadata();
    metadata.set('authorization', 'Bearer 1234')
    console.log(createOrderDto);

    const result = await lastValueFrom(
      this.orderGrpcClient.createOrder(createOrderDto, metadata),
    );
    return result.order;
  }

  async findAll(account_id: string) {
    const metadata = new Metadata();
    metadata.set('authorization', 'Bearer 1234')
    const result = await lastValueFrom(
      this.orderGrpcClient.findAllOrders({ account_id }, metadata),
    );
    return result.orders;
  }

  async findOne(id: string) {
    const metadata = new Metadata();
    metadata.set('authorization', 'Bearer 1234')
    const result = await lastValueFrom(
      this.orderGrpcClient.findOneOrder({ order_id: id }, metadata),
    );
    return result.order;
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: string) {
    return `This action removes a #${id} order`;
  }
}
