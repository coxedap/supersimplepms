import { PrismaClient } from "@prisma/client";

export class SystemService {
  constructor(private readonly prisma: PrismaClient) {}

  public async getConfig(key: string, defaultValue: string): Promise<string> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key }
    });
    return config ? config.value : defaultValue;
  }

  public async getNumberConfig(key: string, defaultValue: number): Promise<number> {
    const val = await this.getConfig(key, defaultValue.toString());
    return parseInt(val, 10);
  }

  public async setConfig(key: string, value: string): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
}
