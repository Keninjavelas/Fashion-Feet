/** Restore the last hardcoded FAQ list as editable database rows, once. */
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { prisma } from "../src/lib/prisma";

const SOURCE_REVISION = "0e581187f972308827c08fc19d859a0629672def";
const SOURCE_PATH = "src/app/faq/FaqClient.tsx";

function property(object: ts.ObjectLiteralExpression, name: string): ts.Expression {
  const value = object.properties.find(
    (item): item is ts.PropertyAssignment =>
      ts.isPropertyAssignment(item) && ts.isIdentifier(item.name) && item.name.text === name,
  )?.initializer;
  if (!value) throw new Error(`Historical FAQ is missing ${name}.`);
  return value;
}

function stringProperty(object: ts.ObjectLiteralExpression, name: string): string {
  const value = property(object, name);
  if (!ts.isStringLiteral(value)) throw new Error(`Historical FAQ ${name} is not a string literal.`);
  return value.text;
}

function arrayProperty(object: ts.ObjectLiteralExpression, name: string): ts.ArrayLiteralExpression {
  const value = property(object, name);
  if (!ts.isArrayLiteralExpression(value)) throw new Error(`Historical FAQ ${name} is not an array.`);
  return value;
}

function historicalFaqs() {
  const source = execFileSync("git", ["show", `${SOURCE_REVISION}:${SOURCE_PATH}`], { encoding: "utf8" });
  const file = ts.createSourceFile(SOURCE_PATH, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = file.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((item) => ts.isIdentifier(item.name) && item.name.text === "faqs");
  if (!declaration?.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) {
    throw new Error("Could not find the historical FAQ array.");
  }

  const rows: { question: string; answer: string; category: string; isPinned: boolean; displayOrder: number }[] = [];
  for (const sectionNode of declaration.initializer.elements) {
    if (!ts.isObjectLiteralExpression(sectionNode)) throw new Error("Unexpected FAQ section structure.");
    const category = stringProperty(sectionNode, "category");
    for (const questionNode of arrayProperty(sectionNode, "questions").elements) {
      if (!ts.isObjectLiteralExpression(questionNode)) throw new Error("Unexpected FAQ question structure.");
      rows.push({
        question: stringProperty(questionNode, "q"),
        answer: stringProperty(questionNode, "a"),
        category,
        isPinned: rows.length === 0,
        displayOrder: rows.length,
      });
    }
  }

  if (rows.length !== 13 || new Set(rows.map((row) => row.question)).size !== 13) {
    throw new Error("Historical FAQ count or uniqueness did not match the expected 13 questions.");
  }
  return rows;
}

async function main() {
  const rows = historicalFaqs();
  const apply = process.argv.includes("--apply");
  console.log(`${apply ? "Restoring" : "Ready to restore"} ${rows.length} historical FAQs from ${SOURCE_REVISION.slice(0, 7)}.`);

  if (!apply) return;
  if (process.env.VERCEL_ENV !== "production" || !/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "")) {
    throw new Error("This restore requires production PostgreSQL environment variables.");
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.faq.count();
    if (existing !== 0) throw new Error(`The FAQ table has ${existing} rows; refusing to create duplicates.`);
    for (const row of rows) await tx.faq.create({ data: row });
    await tx.adminAuditLog.create({
      data: {
        action: "FAQ_HISTORY_RESTORED",
        resourceType: "Faq",
        metadata: JSON.stringify({ sourceRevision: SOURCE_REVISION, count: rows.length }),
      },
    });
  }, { maxWait: 30_000, timeout: 60_000 });
  console.log("Restored 13 FAQs. They are public and editable in the admin dashboard.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "FAQ restore failed.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
