import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    try {

      entity.items.forEach((e) : void => {
        OrderItemModel.update(
          {
            name: e.name,
            price: e.price,
            quantity: e.quantity,
          },
          {
            where: { id: e.id }
          }
        );
      });

      await OrderModel.update(
        {
          id: entity.id,
          customer_id: entity.customerId,
          total: entity.total(),
          items: entity.items,
        },
        {
          where: {
            id: entity.id,
          },
        },
      );
    } catch (error) {
      throw new Error("Was not able to update Order");
    }
  }

  async find(id: string): Promise<Order> {
    let order: Order = null;

    try {
      const orderModel = await OrderModel
          .findOne(
            {
              where: { id: id },
              include: ["items"],
              rejectOnEmpty: true,
            },
          );

      order = new Order(
          orderModel.id,
          orderModel.customer_id,
          orderModel.items.map((i) =>
            new OrderItem(i.id, i.name, i.price, i.product_id, i.quantity)
          ));

    } catch (error) {
      throw new Error("Order not found");
    }
    return order;
  }

  async findAll(): Promise<Order[]> {
    let orders: Order[] = [];

    try {
      await OrderModel
        .findAll({ include: ["items"] })
        .then((orderModel) => {
          orders = orderModel.map((m) => {
            return new Order(
                m.id,
                m.customer_id,
                m.items.map((i) =>
                  new OrderItem(i.id, i.name, i.price, i.product_id, i.quantity)
                ));
          });
        })

    } catch (error) {
      throw new Error("No orders found");
    }
    return orders;
  }
}
