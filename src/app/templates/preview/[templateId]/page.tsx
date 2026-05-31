import React from 'react';
import { notFound } from 'next/navigation';
import { TEMPLATES_REGISTRY } from '../../../../lib/theme/templates';
import { StaticPageRenderer } from '../../../../components/renderer/BlockRenderer';
import { PageBuilderSchema } from '../../../../types/builder';

export const dynamic = 'force-static';

interface TemplatePreviewPageProps {
  params: Promise<{ templateId: string }>;
}

export default async function TemplatePreviewPage({ params }: TemplatePreviewPageProps) {
  const { templateId } = await params;
  const template = TEMPLATES_REGISTRY[templateId] || Object.values(TEMPLATES_REGISTRY).find((item) => item.templateId === templateId);

  if (!template) notFound();

  const schema = JSON.parse(JSON.stringify(template.schema)) as PageBuilderSchema;

  return (
    <main className="min-h-screen bg-white">
      <StaticPageRenderer schema={schema} />
    </main>
  );
}
