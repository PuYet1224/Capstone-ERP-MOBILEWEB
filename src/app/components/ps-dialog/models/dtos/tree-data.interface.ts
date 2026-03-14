export interface TreeDataInterface {
  text: string;
  items?: TreeDataInterface[];
  hasChildren?: boolean;
  path?: string[];
}
