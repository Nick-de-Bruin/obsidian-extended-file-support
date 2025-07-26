import { AltTextParsed, ExtensionComponent } from "src/extensionComponent";
import { ExtensionView } from "src/extensionView";

import initSqlJs from 'sql.js'
// @ts-ignore
import wasmBinary from '../../node_modules/sql.js/dist/sql-wasm.wasm';

export const VIEW_TYPE_CLIP = "extended-file-support-clip";

export class CLIPComponent extends ExtensionComponent {
    private sql: any = null
    private objectURL?: string;

    parseLinkText(_: AltTextParsed): void { }

    private async getSql() {
        if (!this.sql) {
            try{
                this.sql = await initSqlJs({
                    wasmBinary: wasmBinary
                });
            } catch (error) {
                console.error('Failed to load sql.js WebAssembly file required to read .clip files.', error);
                this.sql = false;
            }
        }
        return this.sql;
    }

    async loadFile(): Promise<void> {
        const resource = this.plugin.app.vault.getResourcePath(this.file);
        const res = await fetch(resource);
        const arrayBuffer = await res.arrayBuffer();
        const offset = this.getDatabaseOffset(arrayBuffer);

        if (offset !== -1) {
            const sqliteDB = arrayBuffer.slice(offset);
            const SQL = await this.getSql();
            if( this.sql !== false ){
                const db = new SQL.Database(new Uint8Array(sqliteDB));

                const result = db.exec("SELECT imageData FROM CanvasPreview");

                if (!result || result.length === 0) {
                    throw new Error("No image data found in CanvasPreview table");
                }

                const imageBytes = result[0].values[0][0] as Uint8Array;
                const image_file = new Blob([imageBytes]);
                this.objectURL = URL.createObjectURL(image_file);
            }
        }

        if (this.objectURL) {
            const image = new Image();
            image.src = this.objectURL;
            image.alt = this.file.name;
            if (this.width) {
                image.width = this.width;
            }
            if (this.height) {
                image.height = this.height;
            }
            this.contentEl.empty();
            this.contentEl.removeClass("extended-file-loading");
            this.contentEl.addClasses(["media-embed", "image-embed"]);
            this.contentEl.append(image);
        } else {
            this.contentEl.empty();
            this.contentEl.createEl("i", { text: `Could not load ${this.file.path}` });
        }
    }

	cleanup(): void {
		if (this.objectURL) {
			URL.revokeObjectURL(this.objectURL);
			this.objectURL = undefined;
		}
	}

    getDatabaseOffset(arrayBuffer: ArrayBuffer): number {
        const haystack = new Uint8Array(arrayBuffer);
        const needle = new TextEncoder().encode('SQLite format 3\0');

        for (let i = 0; i <= haystack.length - needle.length; i++) {
            let found = true;
            for (let j = 0; j < needle.length; j++) {
                if (haystack[i + j] !== needle[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return i;
            }
        }

        return -1;
    }
}

export class CLIPView extends ExtensionView<CLIPComponent> {
    getIcon(): string {
        return "image";
    }

    getComponent(): new (...args: ConstructorParameters<typeof ExtensionComponent>) => CLIPComponent {
        return CLIPComponent;
    }

    getViewType(): string {
        return VIEW_TYPE_CLIP;
    }
}
