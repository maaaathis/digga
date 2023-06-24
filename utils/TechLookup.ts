import WebsiteAnalyzer from 'website-analysis-api/src/WebsiteAnalyzer';

import CategoryData from './techstack/categories.json';
import GroupData from './techstack/groups.json';
import TechStackData from './techstack/technologies.json';

class TechLookup {
  static async fetchTechs(domain: string): Promise<any> {
    const analyzer = new WebsiteAnalyzer({
      url: 'https://' + domain + '/',
      technologies: TechStackData,
      categories: CategoryData,
      groups: GroupData,
    });

    const data = await analyzer.analyze();
    return data;
  }
}

export default TechLookup;
