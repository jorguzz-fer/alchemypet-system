-- CreateTable
CREATE TABLE "registros_macroscopia" (
    "id" SERIAL NOT NULL,
    "numero_guia" TEXT NOT NULL,
    "nome_paciente" TEXT NOT NULL,
    "data_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'em_analise',
    "total_frascos" INTEGER NOT NULL DEFAULT 0,
    "total_fragmentos" INTEGER NOT NULL DEFAULT 0,
    "total_cassetes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_macroscopia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frascos" (
    "id" SERIAL NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "quantidade_fragmentos" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "frascos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fragmentos" (
    "id" SERIAL NOT NULL,
    "frasco_id" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "caracteristicas" TEXT[],
    "medidas" TEXT,
    "medidas_nodulo" TEXT,
    "aparencia" TEXT[],
    "consistencia" TEXT[],
    "aspecto_nodulo" TEXT[],
    "cor" TEXT[],
    "representacao" TEXT[],
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fragmentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cassetes" (
    "id" SERIAL NOT NULL,
    "fragmento_id" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "numero_sequencial" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cassetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagens" (
    "id" SERIAL NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "fragmento_id" INTEGER,
    "url" TEXT NOT NULL,
    "nome_arquivo" TEXT,
    "tipo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_mamaria" (
    "id" SERIAL NOT NULL,
    "numero_guia" TEXT NOT NULL,
    "nome_paciente" TEXT NOT NULL,
    "idade" INTEGER,
    "data_coleta" TIMESTAMP(3),
    "medico_solicitante" TEXT,
    "procedencia" TEXT,
    "tipo_especime" TEXT,
    "localizacao" TEXT,
    "lateralidade" TEXT,
    "dimensoes" TEXT,
    "peso" DECIMAL(10,2),
    "aspecto_macroscopico" TEXT,
    "consistencia" TEXT,
    "superficie_corte" TEXT,
    "margens" TEXT,
    "pele" TEXT,
    "areola" TEXT,
    "mamilo" TEXT,
    "tecido_adiposo" TEXT,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'em_analise',
    "data_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_mamaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frascos_mamaria" (
    "id" SERIAL NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "conteudo" TEXT,
    "dimensoes" TEXT,
    "fixador" TEXT DEFAULT 'Formol 10%',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "frascos_mamaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagens_mamaria" (
    "id" SERIAL NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "frasco_id" INTEGER,
    "url" TEXT NOT NULL,
    "nome_arquivo" TEXT,
    "tipo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagens_mamaria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registros_macroscopia_numero_guia_key" ON "registros_macroscopia"("numero_guia");

-- CreateIndex
CREATE INDEX "registros_macroscopia_numero_guia_idx" ON "registros_macroscopia"("numero_guia");

-- CreateIndex
CREATE INDEX "registros_macroscopia_data_registro_idx" ON "registros_macroscopia"("data_registro");

-- CreateIndex
CREATE INDEX "frascos_registro_id_idx" ON "frascos"("registro_id");

-- CreateIndex
CREATE INDEX "fragmentos_frasco_id_idx" ON "fragmentos"("frasco_id");

-- CreateIndex
CREATE UNIQUE INDEX "registros_mamaria_numero_guia_key" ON "registros_mamaria"("numero_guia");

-- AddForeignKey
ALTER TABLE "frascos" ADD CONSTRAINT "frascos_registro_id_fkey" FOREIGN KEY ("registro_id") REFERENCES "registros_macroscopia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fragmentos" ADD CONSTRAINT "fragmentos_frasco_id_fkey" FOREIGN KEY ("frasco_id") REFERENCES "frascos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cassetes" ADD CONSTRAINT "cassetes_fragmento_id_fkey" FOREIGN KEY ("fragmento_id") REFERENCES "fragmentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens" ADD CONSTRAINT "imagens_registro_id_fkey" FOREIGN KEY ("registro_id") REFERENCES "registros_macroscopia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens" ADD CONSTRAINT "imagens_fragmento_id_fkey" FOREIGN KEY ("fragmento_id") REFERENCES "fragmentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frascos_mamaria" ADD CONSTRAINT "frascos_mamaria_registro_id_fkey" FOREIGN KEY ("registro_id") REFERENCES "registros_mamaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens_mamaria" ADD CONSTRAINT "imagens_mamaria_registro_id_fkey" FOREIGN KEY ("registro_id") REFERENCES "registros_mamaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens_mamaria" ADD CONSTRAINT "imagens_mamaria_frasco_id_fkey" FOREIGN KEY ("frasco_id") REFERENCES "frascos_mamaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
