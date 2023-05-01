import { Project as MorphProject } from 'ts-morph';

export interface ProjectConfig {
  tsConfigFilePath: string;
}

export class Project {
  readonly morphProject: MorphProject;

  constructor(config: ProjectConfig) {
    this.morphProject = new MorphProject({
      tsConfigFilePath: config.tsConfigFilePath,
      skipAddingFilesFromTsConfig: true,
    });
  }
}
