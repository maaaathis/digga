import WebsiteAnalyzer from 'website-analysis-api/src/WebsiteAnalyzer';

import TechStackData from './techstack/technologies.json';
import CategoryData from './techstack/categories.json';
import GroupData from './techstack/groups.json';

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
