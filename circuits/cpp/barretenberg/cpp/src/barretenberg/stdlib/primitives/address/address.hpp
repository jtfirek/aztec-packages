#pragma once
#include "barretenberg/numeric/uint256/uint256.hpp"
#include "barretenberg/stdlib/commitment/pedersen/pedersen.hpp"
#include "barretenberg/stdlib/primitives/bool/bool.hpp"
#include "barretenberg/stdlib/primitives/field/field.hpp"
#include "barretenberg/stdlib/primitives/group/group.hpp"
#include "barretenberg/stdlib/primitives/point/point.hpp"
#include "barretenberg/stdlib/primitives/witness/witness.hpp"

namespace proof_system::plonk {
namespace stdlib {

using barretenberg::fr;
using numeric::uint256_t;
using stdlib::bool_t;
using stdlib::field_t;
using stdlib::group;
using stdlib::pedersen_commitment;
using stdlib::point;
using stdlib::witness_t;

// Native type
class address {
  public:
    fr address_;

    address() noexcept { address_ = fr(); }

    address(address const& other)
        : address_(other.address_){};

    address(fr const& address)
        : address_(address){};

    address(uint256_t const& address)
        : address_(address){};

    address(int const& address)
        : address_(fr(address)){};

    operator fr() { return address_; }

    operator fr() const { return address_; }

    constexpr bool operator==(address const& other) const { return this->address_ == other.address_; }

    friend std::ostream& operator<<(std::ostream& os, address const& v) { return os << v.address_; }

    fr to_field() const { return address_; }

    // delegate serialization to field
    void msgpack_pack(auto& packer) const { address_.msgpack_pack(packer); }
    void msgpack_unpack(auto const& o) { address_.msgpack_unpack(o); }
    // help our msgpack schema compiler with this buffer alias (as far as wire representation is concerned) class
    void msgpack_schema(auto& packer) const { packer.pack_alias("Address", "bin32"); }
};

template <typename B> void read(B& it, address& addr)
{
    using serialize::read;
    fr address_field;
    read(it, address_field);
    addr = address(address_field);
}

template <typename B> void write(B& buf, address const& addr)
{
    using serialize::write;
    write(buf, addr.address_);
}

// Circuit type
template <typename Composer> class address_t {
  public:
    field_t<Composer> address_;
    Composer* context_;

    address_t() = default;

    address_t(address_t<Composer> const& other)
        : address_(other.address_)
        , context_(other.context_){};

    address_t(field_t<Composer> const& address)
        : address_(address)
        , context_(address.context){};

    address_t(uint256_t const& address)
        : address_(address)
        , context_(nullptr){};

    address_t(int const& address)
        : address_(address)
        , context_(nullptr){};

    address_t(witness_t<Composer> const& witness)
    {
        address_ = field_t(witness);
        context_ = witness.context;
    }

    address_t<Composer>& operator=(const address_t<Composer>& other)
    {
        address_ = other.address_;
        context_ = other.context_;
        return *this;
    }

    bool_t<Composer> operator==(const address_t& other) const { return this->to_field() == other.to_field(); }

    bool_t<Composer> operator!=(const address_t& other) const { return this->to_field() != other.to_field(); }

    field_t<Composer> to_field() const { return address_; }

    fr get_value() const { return address_.get_value(); };

    void assert_equal(const address_t& rhs, std::string const& msg = "address_t::assert_equal") const
    {
        address_.assert_equal(rhs.address_, msg);
    };

    void assert_is_in_set(const std::vector<address_t>& set,
                          std::string const& msg = "address_t::assert_is_in_set") const
    {
        std::vector<field_t<Composer>> field_set;
        for (const auto& e : set) {
            field_set.push_back(e.address_);
        }
        address_.assert_is_in_set(field_set, msg);
    }

    static address_t conditional_assign(const bool_t<Composer>& predicate, const address_t& lhs, const address_t& rhs)
    {
        return field_t<Composer>::conditional_assign(predicate, lhs.address_, rhs.address_);
    };

    static address_t<Composer> derive_from_private_key(field_t<Composer> const& private_key)
    {
        // TODO: Dummy logic, for now. Proper derivation undecided.
        point<Composer> public_key = group<Composer>::template fixed_base_scalar_mul_g1<254>(private_key);
        return address_t<Composer>(public_key.x);
    }

    friend std::ostream& operator<<(std::ostream& os, address_t<Composer> const& v) { return os << v.address_; }
};

} // namespace stdlib
} // namespace proof_system::plonk
