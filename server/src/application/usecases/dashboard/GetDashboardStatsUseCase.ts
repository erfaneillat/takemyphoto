import { UserModel } from '@infrastructure/database/models/UserModel';
import { TemplateModel } from '@infrastructure/database/models/TemplateModel';
import { CharacterModel } from '@infrastructure/database/models/CharacterModel';

export interface PopularStyle {
  id: string;
  name: string;
  imageUrl: string;
  usageCount: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalUsersChange: number;
  activeUsers: number;
  activeUsersChange: number;
  totalTemplates: number;
  totalTemplatesChange: number;
  totalCharacters: number;
  totalCharactersChange: number;
  recentActivity: ActivityItem[];
  popularStyles: PopularStyle[];
}

export interface ActivityItem {
  id: string;
  type: 'user' | 'template' | 'character';
  message: string;
  timestamp: Date;
  icon?: string;
}

export class GetDashboardStatsUseCase {
  async execute(): Promise<DashboardStats> {
    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total counts and monthly data in parallel
    const [
      totalUsers,
      totalTemplates,
      totalCharacters,
      usersThisMonth,
      usersLastMonth,
      templatesThisMonth,
      templatesLastMonth,
      charactersThisMonth,
      charactersLastMonth,
      recentUsers,
      recentTemplates,
      recentCharacters
    ] = await Promise.all([
      UserModel.countDocuments(),
      TemplateModel.countDocuments(),
      CharacterModel.countDocuments(),
      UserModel.countDocuments({ createdAt: { $gte: startOfMonth, $lte: now } }),
      UserModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      TemplateModel.countDocuments({ createdAt: { $gte: startOfMonth, $lte: now } }),
      TemplateModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      CharacterModel.countDocuments({ createdAt: { $gte: startOfMonth, $lte: now } }),
      CharacterModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      UserModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      TemplateModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      CharacterModel.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    // Calculate percentage changes
    const totalUsersChange = this.calculatePercentageChange(usersThisMonth, usersLastMonth);
    const activeUsersChange = this.calculatePercentageChange(usersThisMonth, usersLastMonth);
    const totalTemplatesChange = this.calculatePercentageChange(templatesThisMonth, templatesLastMonth);
    const totalCharactersChange = this.calculatePercentageChange(charactersThisMonth, charactersLastMonth);

    // Combine and sort recent activity
    const recentActivity: ActivityItem[] = [
      ...recentUsers.map((user: any) => ({
        id: user._id.toString(),
        type: 'user' as const,
        message: `New user registered: ${user.name || user.email || user.phoneNumber || 'Unknown'}`,
        timestamp: user.createdAt,
        icon: 'Users'
      })),
      ...recentTemplates.map((template: any) => ({
        id: template._id.toString(),
        type: 'template' as const,
        message: `New template created: ${template.name}`,
        timestamp: template.createdAt,
        icon: 'FileText'
      })),
      ...recentCharacters.map((character: any) => ({
        id: character._id.toString(),
        type: 'character' as const,
        message: `New character added: ${character.name}`,
        timestamp: character.createdAt,
        icon: 'User'
      }))
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Get popular styles
    const popularTemplates = await TemplateModel
      .find()
      .sort({ usageCount: -1 })
      .limit(5)
      .lean();

    const popularStyles: PopularStyle[] = popularTemplates.map(template => ({
      id: template._id.toString(),
      name: template.prompt || template.style || 'Unnamed Style',
      imageUrl: template.imageUrl,
      usageCount: template.usageCount || 0
    }));

    return {
      totalUsers,
      totalUsersChange,
      activeUsers: usersThisMonth,
      activeUsersChange,
      totalTemplates,
      totalTemplatesChange,
      totalCharacters,
      totalCharactersChange,
      recentActivity,
      popularStyles
    };
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }
}
