export type FileOrFolder = File | Folder;

export interface Rename {
  name: string;
}
export interface File {
  name: string;
  type: string;
  description: string;
  content: string;
}

export interface Folder {
  name: string;
  type: string;
  children: FileOrFolder[];
}

export interface State {
  data: Folder[];
  openFileData: File[];
  UIstate: UIState;
}

export interface UIState {
  currentNodeType: string | null;
  currentFolderDom: HTMLElement | null;
  currentFolderData: Folder | null;
  currentFileDom: HTMLElement | null;
  currentFileData: File | null;
}

export interface DomElements {
  fileExplorer: HTMLElement | null;
  openListTab: HTMLElement | null;
  openContentTab: HTMLElement | null;
  createFolderBtn: HTMLElement | null;
  removeFolderBtn: HTMLElement | null;
  uploadFileBtn: HTMLElement | null;
  downloadFileBtn: HTMLElement | null;
  removeFileBtn: HTMLElement | null;
  renameBtn: HTMLElement | null;
  editFileDescBtn: HTMLElement | null;
}