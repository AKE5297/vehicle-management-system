// 支付服务 - 管理支付相关的配置和图片资源
class PaymentService {
  // 支付图片资源
  private readonly paymentImages = {
    // 微信支付图片URL
    wechatPay: 'https://img.789600.xyz/file/AgACAgUAAyEGAASoCPKDAAMSaNaafzhyBx8fraStspoUVVkgRC8AAmbOMRs2CLBW6cJue5eR9ywBAAMCAAN3AAM2BA.jpg',
    
    // 支付宝图片URL
    alipay: 'https://img.789600.xyz/file/AgACAgUAAyEGAASoCPKDAAMTaNaa1SXeuPTom7cThJtJkopWtigAAmfOMRs2CLBWxF1VteTNUnsBAAMCAAN3AAM2BA.jpg'
  };

  // 获取微信支付图片URL
  getWechatPayImage(): string {
    return this.paymentImages.wechatPay;
  }

  // 获取支付宝图片URL
  getAlipayImage(): string {
    return this.paymentImages.alipay;
  }

  // 获取所有支付方式图片
  getAllPaymentImages(): Record<string, string> {
    return this.paymentImages;
  }
}

// 导出支付服务实例
export const paymentService = new PaymentService();