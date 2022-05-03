# The MIT License (MIT)
# 
# Copyright (c) 2018 Ribose
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

require 'nokogiri'
require 'uri'

# Given hostname and content, updates any found <a> elements as follows:
#
# - Adds `rel` attribute
# - Appends inner markup for external link icon
#
# Only processes external links where `href` starts with "http"
# and target host does not start with given site hostname.
def process_content(site_hostname, content, marker_html, link_selector, exclude_selectors=[])
  content = Nokogiri::HTML(content)
  content.css(link_selector).each do |a|
    next if matches_one_of(a, exclude_selectors)
    next unless a.get_attribute('href') =~ /\Ahttp/i
    next if a.get_attribute('href') =~ /\Ahttp(s)?:\/\/#{site_hostname}\//i
    next if a.inner_html.include? "ico-ext"
    a.set_attribute('rel', 'external')
    a.inner_html = "#{a.inner_html}#{marker_html}"
  end
  return content.to_s
end

def mark_links_in_page_or_document(page_or_document)
  site_hostname = URI(page_or_document.site.config['url']).host

  ext_link_config = page_or_document.site.config['external_links'] || {}

  # The link is marked as external by:
  # (1) setting the rel attribute to external and
  # (2) appending specified marker HTML.
  # Default marker is Font Awesome icon.
  marker_html = ext_link_config['marker_html'] || "<span class='ico-ext'><i class='fas fa-external-link-square-alt'></i></span>"

  # Determines which links to mark. E.g., usually we don’t want to mark navigational links.
  link_selector = ext_link_config['selector'] || 'main a'

  # Determining which links to ignore. For example, links comprised entirely from images
  # may look incorrectly with external marker. 
  unmarked_link_selectors = ext_link_config['ignored_selectors'] || [
    'a[href*=travis]',
    'a[href*=coverity]',
    'a[href*=codecov]',
  ]

  unless page_or_document.respond_to?(:asset_file?) and page_or_document.asset_file?
    page_or_document.output = process_content(
      site_hostname,
      page_or_document.output,
      marker_html,
      link_selector,
      unmarked_link_selectors)
  end
end

# Returns true if Nokogiri’s Node matches one of selectors,
# otherwise return false
def matches_one_of(node, selectors)
  for selector in selectors
    if node.matches? selector
      return true
    end
  end
  return false
end

Jekyll::Hooks.register :documents, :post_render do |doc|
  mark_links_in_page_or_document(doc)
end

Jekyll::Hooks.register :pages, :post_render do |page|
  mark_links_in_page_or_document(page)
end
