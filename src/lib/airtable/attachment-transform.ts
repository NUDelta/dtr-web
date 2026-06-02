import type { Attachment } from 'ts-airtable'
import { ensureImageInR2 } from '@/lib/image-cache'
import { safeLog } from '@/lib/logger'

export interface AirtableRow<TFields = Record<string, unknown>> {
  id: string
  fields: TFields
}

interface AttachmentTransformContext {
  tableName?: string
  recordId?: string
  fieldName?: string
  logger?: CacheLogger
}

function isAttachment(value: unknown): value is Attachment {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && typeof value.id === 'string'
    && 'url' in value
    && typeof value.url === 'string'
    && 'filename' in value
    && typeof value.filename === 'string'
    && 'type' in value
    && typeof value.type === 'string'
  )
}

export async function transformAttachmentForCache(
  attachment: Attachment,
  context: AttachmentTransformContext = {},
): Promise<Attachment> {
  if (!attachment.type.startsWith('image/')) {
    return attachment
  }

  try {
    const { url } = await ensureImageInR2(attachment, 'full')
    return { ...attachment, url }
  }
  catch (error) {
    safeLog(context.logger, {
      kind: 'transformAttachmentError',
      key: [
        context.tableName,
        context.recordId,
        context.fieldName,
      ].filter(value => value !== undefined).join(':') || attachment.id,
      fullKey: attachment.id,
      table: context.tableName,
      timestamp: Date.now(),
      error,
    })
    return attachment
  }
}

async function transformRecordAttachments<TFields>(
  tableName: string,
  row: AirtableRow<TFields>,
  logger?: CacheLogger,
): Promise<AirtableRow<TFields>> {
  const fields = row.fields as Record<string, unknown>
  const transformedFields: Record<string, unknown> = { ...fields }
  let changed = false

  for (const [fieldName, value] of Object.entries(fields)) {
    if (!Array.isArray(value)) {
      continue
    }

    let fieldChanged = false
    const items: unknown[] = value
    const transformedValue = await Promise.all(
      items.map(async (item: unknown) => {
        if (!isAttachment(item)) {
          return item
        }

        const transformed = await transformAttachmentForCache(item, {
          tableName,
          recordId: row.id,
          fieldName,
          logger,
        })
        if (transformed !== item) {
          fieldChanged = true
          changed = true
        }
        return transformed
      }),
    )

    if (fieldChanged) {
      transformedFields[fieldName] = transformedValue
    }
  }

  return changed ? { ...row, fields: transformedFields as TFields } : row
}

export async function transformRowsAttachmentsForCache<TFields>(
  tableName: string,
  rows: AirtableRow<TFields>[],
  logger?: CacheLogger,
): Promise<AirtableRow<TFields>[]> {
  return Promise.all(rows.map(async row => transformRecordAttachments(tableName, row, logger)))
}
