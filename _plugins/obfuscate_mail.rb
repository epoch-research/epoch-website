# Downloaded from https://gist.github.com/patrickfav/3f9127e25dd6538f0d682b89cbfaefd9
# and modified

require "base64"
require "uri"

module ObfuscateMailAddress
  def obfuscate_mail(input)
    base64Mail = Base64.strict_encode64(Addressable::URI.encode(input))
    return base64Mail
  end
end

Liquid::Template.register_filter(ObfuscateMailAddress)
