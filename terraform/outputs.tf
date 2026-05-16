output "pages_project_name" {
  description = "The name of the Cloudflare Pages project"
  value       = cloudflare_pages_project.textbooks.name
}

output "pages_project_subdomain" {
  description = "The subdomain for the Cloudflare Pages project"
  value       = cloudflare_pages_project.textbooks.subdomain
}

output "pages_project_domains" {
  description = "The domains associated with the Cloudflare Pages project"
  value       = cloudflare_pages_project.textbooks.domains
}

output "custom_domain" {
  description = "The custom domain bound to the Pages project"
  value       = cloudflare_pages_domain.textbooks.domain
}
