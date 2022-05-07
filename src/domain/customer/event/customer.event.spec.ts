import { Sequelize } from "sequelize-typescript";
import Customer from "../entity/customer";
import Address from "../value-object/address";
import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";

describe("Customer events tests", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([CustomerModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should handle events 1 and 2 when create a customer", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);

    const eventHandler1 = customer.eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0];
    const eventHandler2 = customer.eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1];

    const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");
    const clog = jest.spyOn(console, 'log');

    await customerRepository.create(customer);

    expect(spyEventHandler1).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();
    expect(clog.mock.calls[0][0]).toBe("Esse é o primeiro console.log do evento: CustomerCreatedEvent");
    expect(clog.mock.calls[1][0]).toBe("Esse é o segundo console.log do evento: CustomerCreatedEvent");
  });

  it("should handle 1 event when update a customer address", async () => {
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.Address = address;

    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");

    const eventHandler = customer.eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"][0];
    const spyEventHandler = jest.spyOn(eventHandler, "handle");
    const clog = jest.spyOn(console, 'log');

    customer.changeAddress(address2);

    expect(spyEventHandler).toHaveBeenCalled();
    expect(clog.mock.calls[0][0]).toBe(
      `Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${address2.street} ${address2.number} ${address2.zip} ${address2.city}`
    );
  });
});
