export class BillingOptionsUtil {

  public static NONE_SPECIFIED = 'None specified';
  public static PAY_AT_DROP_OFF = 'Pay at drop off';
  public static BILL_RECIPIENT = 'Bill Recipient';
  public static BILL_THIRD_PARTY = 'Bill Third Party';
  public static BILL_MY_ACCOUNT = 'Bill My Account';
  public static BILLING_OPTION_DEFAULT = '';
  public static TRANSPORT_COST = 'TransportCost';
  public static DUTIES_TAX = 'DutiesTax';
  public static ACCOUNT_BILLING = 'ACCOUNT_BILLING';
  public static TRANSPORT_OPTIONS = 'TRANSPORT_OPTIONS';
  public static DUTYTAX_OPTIONS = 'DUTYTAX_OPTIONS';
  public static LOCAL_SENDER_KEY = 'S';
  public static LOCAL_RECIPIENT_KEY = 'R';
  public static LOCAL_THIRD_PART_KEY = 'O';

  public static getPaymentType(payment: string) {
    return this.getPaymentTypeList().find(resource => resource.key === payment);
  }

  public static getPaymentTypeList() {
    return [
      {
        key: this.PAY_AT_DROP_OFF,
        value: 'PAY_AT_DROP_OFF',
        translationKey: 'payAtDropOff'
      },
      {
        key: this.BILL_RECIPIENT,
        value: 'RECIPIENT',
        translationKey: 'billRecipient'
      },
      {
        key: this.BILL_MY_ACCOUNT,
        value: 'SENDER',
        translationKey: 'billMyAccount'
      },
      {
        key: this.BILL_THIRD_PARTY,
        value: 'THIRD_PARTY',
        translationKey: 'billThirdParty'
      }
    ];
  }
}
