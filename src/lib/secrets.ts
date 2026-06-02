import process from 'node:process'

function getEnvValue(key: string): string | undefined {
  const value = process.env[key]
  return value !== undefined && value.length > 0 ? value : undefined
}

export function getCicdSecret(): string | undefined {
  return (
    getEnvValue('CICD_SECRET')
    ?? getEnvValue('AIRTABLE_REFRESH_SECRET')
    ?? getEnvValue('AIRTABLE_BACKUP_SECRET')
    ?? getEnvValue('R2_CRON_SECRET')
  )
}

export function getOpsSecret(): string | undefined {
  return (
    getEnvValue('OPS_SECRET')
    ?? getEnvValue('AIRTABLE_REFRESH_SECRET')
    ?? getEnvValue('R2_CRON_SECRET')
  )
}
