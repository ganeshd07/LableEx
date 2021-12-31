import { LogLevel } from 'typescript-logging';


export class Logger {
    private _message: string;
    private _level: LogLevel;
    private _additionalInfo: any[];

    public get level(): LogLevel {
        return this._level;
    }

    public set level(_level: LogLevel) {
        this._level = _level;
    }

    public get message(): string {
        return this._message;
    }

    public set message(_message: string) {
        this._message = _message;
    }

    public get additionalInfo(): any[] {
        return this._additionalInfo;
    }

    public set additionalInfo(_extraInfo: any[]) {
        this._additionalInfo = _extraInfo;
    }

   
}