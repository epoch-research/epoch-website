module Jekyll
    module BetterJoinFilter
      def better_join(input, middle_separator = " ", last_separator = " ")
        if input.length() == 0 then
          return "";
        elsif input.length() == 1 then
          return input[0];
        else
          return input[..-2].join(middle_separator) + last_separator + input[-1];
        end
      end
    end
end

Liquid::Template.register_filter(Jekyll::BetterJoinFilter)
