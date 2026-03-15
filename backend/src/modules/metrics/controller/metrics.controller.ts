import { Request, Response } from 'express';
import { MetricsService } from '../application/metrics.service';

export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  public async getWeeklyMetrics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { weekStart } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      if (!weekStart) {
        return res.status(400).json({ error: 'weekStart is required' });
      }

      const date = new Date(weekStart as string);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid weekStart date format' });
      }

      const metrics = await this.metricsService.calculateWeeklyMetrics(userId, date);
      return res.json(metrics);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }

  public async getHistoricalMetrics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // We'll add historical retrieval logic to the service if needed, 
      // but for now let's just use the calculation for the specific week
      // or implement a simple query here using prisma if we want to be quick.
      // Since the service has prisma, we can maybe add a getHistory method to it.
      
      // Let's assume we want the last 4 weeks.
      // But first, let's just implement the single week endpoint as requested by the skeleton.
      res.status(501).json({ error: 'Historical metrics not yet implemented' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
