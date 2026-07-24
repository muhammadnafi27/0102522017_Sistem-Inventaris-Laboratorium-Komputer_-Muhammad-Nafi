import type { KesalahanField } from "@/utilitas/respons";

// Kelas error terstandarisasi agar service/controller dapat melempar error dengan status HTTP
// yang jelas, lalu ditangkap satu kali oleh error handler pusat.
export class KesalahanAplikasi extends Error {
  public readonly statusCode: number;
  public readonly kesalahanField?: KesalahanField[];

  constructor(statusCode: number, pesan: string, kesalahanField?: KesalahanField[]) {
    super(pesan);
    this.statusCode = statusCode;
    this.kesalahanField = kesalahanField;
    this.name = "KesalahanAplikasi";
  }
}
