export interface IFile {
    id: number;
    name: string;
    size: number;
    url: string;
    mimeType: string;
    updateCallback: React.Dispatch<React.SetStateAction<number>>
}