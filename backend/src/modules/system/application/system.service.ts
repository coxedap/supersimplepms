import { PrismaClient } from "@prisma/client";

export class SystemService {
  constructor(private readonly prisma: PrismaClient) {}

  public async getConfig(organizationId: string, key: string, defaultValue: string): Promise<string> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { organizationId_key: { organizationId, key } }
    });
    return config ? config.value : defaultValue;
  }

  public async getNumberConfig(organizationId: string, key: string, defaultValue: number): Promise<number> {
    const val = await this.getConfig(organizationId, key, defaultValue.toString());
    return parseInt(val, 10);
  }

  public async setConfig(organizationId: string, key: string, value: string): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { organizationId_key: { organizationId, key } },
      update: { value },
      create: { key, value, organizationId }
    });
  }
}
