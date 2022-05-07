import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerAddressChangedEvent from "../customer-address-changed.event";

export default class SendConsoleLogWhenCustomerAddressChangedHandler
  implements EventHandlerInterface<CustomerAddressChangedEvent>
{
  handle(event: CustomerAddressChangedEvent): void {
    const customer = event.eventData;
    const address = customer.Address;
    console.log(
      `Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${address.street} ${address.number} ${address.zip} ${address.city}`
    );
  }
}
