import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export interface WelcomeEmailProps {
  brandName: string;
  tagline: string;
}

export function WelcomeEmail({ brandName, tagline }: WelcomeEmailProps) {
  return (
    <Html lang="bg">
      <Head />
      <Preview>{`Записахме те — ${brandName}`}</Preview>
      <Body style={{ backgroundColor: "#fafafa", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            margin: "40px auto",
            maxWidth: "480px",
            padding: "32px",
          }}
        >
          <Heading as="h1" style={{ fontSize: "22px", marginTop: 0 }}>
            {brandName}
          </Heading>
          <Text>Здравей! 👋</Text>
          <Text>
            Записахме те за ранен достъп до <strong>{brandName}</strong> —{" "}
            {tagline}.
          </Text>
          <Text>
            Ще ти пишем само веднъж — когато сме готови да те пуснем вътре.
          </Text>
          <Text style={{ color: "#6b7280", fontSize: "13px" }}>
            Получаваш това писмо, защото се записа през страницата ни. Ако не си
            бил ти — просто го игнорирай.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
