import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

/**
 * Subida de adjuntos solo para desarrollo: los archivos quedan en `public/uploads/tickets`
 * del front (mismo origen que el dashboard). En producción se usa Nest `POST /tickets/upload`.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { status: false, message: "No se recibió ningún archivo" },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { status: false, message: "El archivo excede el tamaño máximo de 5MB" },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Tipo de archivo no permitido. Solo se permiten PNG, JPG y PDF",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "tickets");

    await fs.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/tickets/${fileName}`;

    return NextResponse.json({
      status: true,
      message: "Archivo subido correctamente",
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error subiendo archivo:", error);
    return NextResponse.json(
      { status: false, message: "Error al subir el archivo" },
      { status: 500 },
    );
  }
}
