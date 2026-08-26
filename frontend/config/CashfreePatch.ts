import { Platform } from "react-native";
import { CFPaymentGatewayService } from "react-native-cashfree-pg-sdk";

if (Platform.OS === "web") {
  // Polyfill dummy emitter on Web to prevent addListener undefined errors
  if (CFPaymentGatewayService && !(CFPaymentGatewayService as any).emitter) {
    (CFPaymentGatewayService as any).emitter = {
      addListener: () => ({ remove: () => {} }),
      removeListener: () => {},
      removeAllListeners: () => {},
      emit: () => {},
    };
  }

  // Override native methods on Web to prevent CashfreePgApi Proxy errors
  CFPaymentGatewayService.setCallback = () => {};
  CFPaymentGatewayService.removeCallback = () => {};
  CFPaymentGatewayService.doPayment = () => {};
  CFPaymentGatewayService.setEventSubscriber = () => {};
  CFPaymentGatewayService.removeEventSubscriber = () => {};
}
